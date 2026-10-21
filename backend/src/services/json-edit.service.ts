import { ApiError } from "@google/genai";
import { GoogleGenAI } from "@google/genai";

import { FinishReason, GenerateContentConfig, Part } from "@google/genai";

import { IMAGE_MODEL } from "../types/image.types";

/**
 * Errors raised by this service carry an
 * HTTP status so the controller can
 * forward the correct code.
 */
export class JsonEditError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.name = "JsonEditError";

    this.statusCode = statusCode;
  }
}

/**
 * Same budget as the extraction service: the
 * instruction rewrites a full JSON document, so
 * a truncated answer would be unusable.
 */
const REQUEST_TIMEOUT_MS = 120_000;

const MAX_OUTPUT_TOKENS = 32_000;

export const MAX_INSTRUCTION_LENGTH = 4_000;

/**
 * Lazily created client so a missing API
 * key never breaks the rest of the server
 * on startup.
 */
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new JsonEditError("Gemini API key is not configured", 500);
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        timeout: REQUEST_TIMEOUT_MS,
      },
    });
  }

  return client;
}

const EDIT_INSTRUCTIONS = [
  "You are a JSON editing assistant.",
  "",
  "You receive a JSON document and a plain language instruction.",
  "Apply the instruction to the document and return the full,",
  "edited JSON document.",
  "",
  "Rules:",
  "1. Return only the edited JSON. No Markdown, no code fences and",
  "   no commentary before or after it.",
  "2. Keep the original structure, key order and value types unless",
  "   the instruction asks for a change.",
  "3. Preserve every part of the document the instruction does not",
  "   mention, exactly as it was.",
  "4. The result must always be valid JSON that parses on its own.",
  "5. The top level may be an object or an array. Never wrap the",
  "   document in an extra object.",
  "6. Do not invent values that the instruction does not ask for.",
].join("\n");

/**
 * Build the Gemini request. The document and
 * the instruction travel as plain text so the
 * model sees exactly what the user is editing.
 */
function buildRequest(jsonText: string, instruction: string) {
  const parts: Part[] = [
    {
      text: EDIT_INSTRUCTIONS,
    },
    {
      text: `Current JSON:\n${jsonText}\n\nInstruction:\n${instruction}`,
    },
  ];

  const config: GenerateContentConfig = {
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    responseMimeType: "application/json",
  };

  return {
    model: IMAGE_MODEL,
    contents: [
      {
        role: "user" as const,
        parts,
      },
    ],
    config,
  };
}

/**
 * Parse the model answer into any JSON value.
 *
 * Structured output normally returns clean
 * JSON, but the text can still arrive wrapped
 * in a code fence, so the outer braces or
 * brackets are located by hand as a fallback.
 */
function parseJsonResponse(raw: string): unknown {
  const text = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    /*
     * Fall through to a bracket scan.
     */
  }

  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");

  const candidates = [objectStart, arrayStart].filter((index) => index !== -1);

  if (candidates.length === 0) {
    throw new JsonEditError("The model returned malformed JSON", 502);
  }

  const start = Math.min(...candidates);

  const expectedClose: string[] = [];

  let inString = false;

  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const character = text[index];

    if (escaped) {
      escaped = false;

      continue;
    }

    if (character === "\\") {
      escaped = true;

      continue;
    }

    if (character === '"') {
      inString = !inString;

      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      expectedClose.push("}");
    } else if (character === "[") {
      expectedClose.push("]");
    } else if (character === "}" || character === "]") {
      if (expectedClose.pop() !== character) {
        break;
      }

      if (expectedClose.length === 0) {
        const candidate = text.slice(start, index + 1);

        try {
          return JSON.parse(candidate);
        } catch {
          break;
        }
      }
    }
  }

  throw new JsonEditError("The model returned malformed JSON", 502);
}

/**
 * Reason why a response carried no text.
 */
function describeEmptyResponse(
  finishReason?: FinishReason,
  blockReason?: string,
): string {
  if (blockReason) {
    return `The request was blocked by Gemini safety filters (${blockReason})`;
  }

  if (finishReason === "MAX_TOKENS") {
    return "The model output was truncated (maxOutputTokens exceeded). Try a shorter instruction.";
  }

  if (
    finishReason === "SAFETY" ||
    finishReason === "PROHIBITED_CONTENT" ||
    finishReason === "BLOCKLIST" ||
    finishReason === "IMAGE_SAFETY" ||
    finishReason === "SPII"
  ) {
    return `Gemini stopped generating a response (${finishReason})`;
  }

  return "The model returned an empty response";
}

/**
 * True when the failure is a transport
 * problem rather than an API answer.
 */
function isConnectionFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const name = error.name.toLowerCase();

  if (
    name === "aborterror" ||
    name === "timeouterror" ||
    name === "fetcherror"
  ) {
    return true;
  }

  const message = String(error.message ?? "").toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("socket hang up") ||
    message.includes("network")
  );
}

/**
 * Translate a Gemini SDK failure into a
 * readable API error.
 */
function toEditError(error: unknown): JsonEditError {
  if (error instanceof JsonEditError) {
    return error;
  }

  if (error instanceof ApiError) {
    const status = error.status ?? 502;

    if (status === 429) {
      return new JsonEditError(
        "Gemini is rate limiting requests. Please try again shortly.",
        429,
      );
    }

    if (status >= 400 && status < 500) {
      return new JsonEditError(
        `Gemini rejected the request: ${error.message ?? "unknown error"}`,
        400,
      );
    }

    return new JsonEditError(
      `Gemini failed to process the edit: ${error.message ?? "unknown error"}`,
      502,
    );
  }

  if (isConnectionFailure(error)) {
    return new JsonEditError(
      "Gemini could not be reached. Please try again.",
      502,
    );
  }

  return new JsonEditError(
    error instanceof Error
      ? error.message
      : "Unable to edit the JSON with AI",
    500,
  );
}

/**
 * Apply one plain language instruction to a
 * JSON document with Gemini.
 *
 * POST /api/json-edit
 */
export async function editJsonWithAi(
  json: unknown,
  instruction: string,
): Promise<unknown> {
  const trimmed = instruction.trim();

  if (!trimmed) {
    throw new JsonEditError("The edit instruction cannot be empty", 400);
  }

  if (trimmed.length > MAX_INSTRUCTION_LENGTH) {
    throw new JsonEditError(
      `The edit instruction must be at most ${MAX_INSTRUCTION_LENGTH} characters`,
      400,
    );
  }

  const jsonText = JSON.stringify(json ?? null, null, 2);

  if (!jsonText) {
    throw new JsonEditError("The JSON to edit could not be serialized", 400);
  }

  const gemini = getClient();

  let response;

  try {
    response = await gemini.models.generateContent(
      buildRequest(jsonText, trimmed),
    );
  } catch (error) {
    throw toEditError(error);
  }

  const text = response.text;
  const finishReason = response.candidates?.[0]?.finishReason;

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new JsonEditError(
      describeEmptyResponse(finishReason, response.promptFeedback?.blockReason),
      502,
    );
  }

  return parseJsonResponse(text);
}
