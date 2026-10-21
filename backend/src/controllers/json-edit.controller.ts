import {
  Request,
  Response,
} from "express";

import {
  editJsonWithAi,
  JsonEditError,
  MAX_INSTRUCTION_LENGTH,
} from "../services/json-edit.service";

/**
 * Edit a JSON document with Gemini.
 *
 * POST /api/json-edit
 *
 * Expects application/json with:
 * - json: the document to edit (any JSON value)
 * - instruction: the plain language change
 */
export async function jsonEditController(
  req: Request,
  res: Response
) {
  try {
    const body = req.body as {
      json?: unknown;
      instruction?: unknown;
    };

    if (body === null || typeof body !== "object") {
      return res.status(400).json({
        success: false,
        message:
          "Send a JSON body with the \"json\" and \"instruction\" fields.",
      });
    }

    /*
     * The document itself may legitimately be
     * missing only when it is literally null,
     * so the field is detected with the "in"
     * operator rather than a truthiness check.
     */
    if (!("json" in body)) {
      return res.status(400).json({
        success: false,
        message:
          "No JSON document was provided. Send it in the \"json\" field.",
      });
    }

    if (typeof body.instruction !== "string" || !body.instruction.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No edit instruction was provided. Send it in the \"instruction\" field.",
      });
    }

    if (body.instruction.length > MAX_INSTRUCTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message:
          `The edit instruction must be at most ${MAX_INSTRUCTION_LENGTH} characters.`,
      });
    }

    /*
     * Ask Gemini to apply the instruction.
     */
    const data = await editJsonWithAi(
      body.json,
      body.instruction
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "JSON edit controller error:",
      error
    );

    /*
     * Service errors already carry the
     * status code that fits the failure.
     */
    if (error instanceof JsonEditError) {
      return res
        .status(error.statusCode)
        .json({
          success: false,
          message: error.message,
        });
    }

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to edit the JSON with AI",
    });
  }
}
