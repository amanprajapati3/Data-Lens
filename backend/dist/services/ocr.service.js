"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrExtractionError = void 0;
exports.extractOcrText = extractOcrText;
const genai_1 = require("@google/genai");
const ocr_types_1 = require("../types/ocr.types");
/**
 * Errors raised by this service carry an
 * HTTP status so the controller can
 * forward the correct code.
 */
class OcrExtractionError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.name = "OcrExtractionError";
        this.statusCode = statusCode;
    }
}
exports.OcrExtractionError = OcrExtractionError;
const REQUEST_TIMEOUT_MS = 120_000;
const OCR_INSTRUCTIONS = [
    "You are an OCR engine that converts a scanned document, screenshot,",
    "or photographed page into clean, well-structured GitHub-flavoured",
    "Markdown.",
    "",
    "Transcribe every piece of visible text exactly as it appears.",
    "Preserve the original language, spelling, casing, punctuation,",
    "line order, and numbers. Never translate, summarise, complete,",
    "or invent text.",
    "",
    "Preserve the hierarchy and reading order of the page:",
    "1. Pre-title or eyebrow labels (small text above a heading, for",
    '   example "CASE STUDY" or "OUR SERVICES") become a bold line on',
    "   their own: **CASE STUDY**.",
    "2. Main headings become #, major sections ##, subsections ###, and",
    "   smaller headings ####, based on visual size and prominence. Do",
    "   not skip heading levels.",
    "3. Body paragraphs become separate paragraphs separated by a blank",
    "   line. Never merge unrelated sections into one paragraph.",
    "4. Bullet lists become - items, numbered lists become 1. items, and",
    "   checklists become - [ ] or - [x] items. Keep nested lists nested.",
    "5. Tables become Markdown tables with a header row. Keep every cell",
    "   aligned with the correct column.",
    "6. Key/value pairs become a two-column Markdown table, or",
    "   **Label:** value when a table does not fit the layout.",
    "7. Buttons, tabs, badges, chips, tags, and navigation labels become",
    "   bold text on their own line.",
    "8. Links, emails, and phone numbers become [text](url) or plain",
    "   text when the target is not visible in the page.",
    "9. Icons: when an icon carries meaning, add its meaning after the",
    "   related text in italics, for example *[phone icon]*,",
    "   *[email icon]*, *[location icon]*, *[warning icon]*,",
    "   *[check icon]*, *[star icon]*, *[play icon]*. Never describe",
    "   purely decorative shapes.",
    "10. Captions, footnotes, labels, prices, and statistics stay with",
    "    their related block. Write statistics as **Value** - Label.",
    "11. QR codes and barcodes become *[QR code]* or *[barcode]*.",
    "12. Images, charts, and diagrams without readable text become",
    "    *[image: short description]* only when they carry content.",
    "",
    "Layout rules:",
    "- Respect multi-column layouts: finish the left column before the",
    "  right column when the page is clearly two columns.",
    "- Keep short lines such as address lines on separate lines using a",
    "  Markdown hard break (two trailing spaces) or a list.",
    "- Header and footer text is included only when it is part of the",
    "  document content.",
    "- Do not wrap the answer in a code fence.",
    "- Do not add commentary, notes, introductions, or explanations.",
    "- If the page has no readable text, return exactly:",
    "  _No readable text found._",
    "- If a word is genuinely illegible, write [?] instead of guessing.",
    "",
    "Return only the Markdown document.",
].join("\n");
let client = null;
function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        throw new OcrExtractionError("Gemini API key is not configured", 500);
    }
    if (!client) {
        client = new genai_1.GoogleGenAI({
            apiKey: apiKey.trim(),
            httpOptions: {
                timeout: REQUEST_TIMEOUT_MS,
            },
        });
    }
    return client;
}
function buildRequest(page) {
    const parts = [
        {
            text: OCR_INSTRUCTIONS,
        },
        {
            inlineData: {
                mimeType: page.mimetype,
                data: page.buffer.toString("base64"),
            },
        },
    ];
    const config = {
        maxOutputTokens: ocr_types_1.OCR_MAX_OUTPUT_TOKENS,
        temperature: 0,
    };
    return {
        model: ocr_types_1.OCR_MODEL,
        contents: [
            {
                role: "user",
                parts,
            },
        ],
        config,
    };
}
function describeEmptyResponse(finishReason, blockReason) {
    if (blockReason) {
        return `The page was blocked by Gemini safety filters (${blockReason})`;
    }
    if (finishReason === "MAX_TOKENS") {
        return "The extracted text was too long for one request. Try a smaller page or split the document.";
    }
    if (finishReason === "SAFETY" ||
        finishReason === "PROHIBITED_CONTENT" ||
        finishReason === "BLOCKLIST" ||
        finishReason === "IMAGE_SAFETY" ||
        finishReason === "SPII") {
        return `Gemini stopped reading the page (${finishReason})`;
    }
    return "The model returned an empty OCR response";
}
function isConnectionFailure(error) {
    if (!(error instanceof Error)) {
        return false;
    }
    const name = error.name.toLowerCase();
    if (name === "aborterror" ||
        name === "timeouterror" ||
        name === "fetcherror") {
        return true;
    }
    const message = String(error.message ?? "").toLowerCase();
    return (message.includes("fetch failed") ||
        message.includes("econnrefused") ||
        message.includes("etimedout") ||
        message.includes("socket hang up") ||
        message.includes("network"));
}
function toOcrError(error) {
    if (error instanceof OcrExtractionError) {
        return error;
    }
    if (error instanceof genai_1.ApiError) {
        if (error.status === 401 || error.status === 403) {
            return new OcrExtractionError("Gemini rejected the API key", 500);
        }
        if (error.status === 429) {
            return new OcrExtractionError("Gemini rate limit reached. Please try again shortly.", 429);
        }
        return new OcrExtractionError(`Gemini request failed: ${error.message}`, 502);
    }
    if (isConnectionFailure(error)) {
        return new OcrExtractionError("Could not reach Gemini. Please try again.", 502);
    }
    console.error("Unexpected OCR extraction error:", error);
    return new OcrExtractionError("OCR extraction failed", 500);
}
/**
 * Remove a code fence if the model wrapped
 * the Markdown despite the instructions.
 */
function cleanMarkdown(raw) {
    const text = raw.trim();
    if (!text.startsWith("```")) {
        return text;
    }
    return text
        .replace(/^```(?:markdown|md)?\s*\n?/i, "")
        .replace(/\n?```\s*$/, "")
        .trim();
}
/**
 * Read one page and return structured
 * Markdown that follows the page layout.
 *
 * The page is sent to Gemini as inline
 * image data and is never stored.
 */
async function extractOcrText(page) {
    const gemini = getClient();
    try {
        const response = await gemini.models.generateContent(buildRequest(page));
        const text = response.text;
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
            throw new OcrExtractionError(describeEmptyResponse(finishReason), 502);
        }
        if (!text || typeof text !== "string" || !text.trim()) {
            throw new OcrExtractionError(describeEmptyResponse(finishReason, response.promptFeedback?.blockReason), 502);
        }
        const cleaned = cleanMarkdown(text);
        if (!cleaned) {
            throw new OcrExtractionError("The model returned an empty OCR response", 502);
        }
        return cleaned;
    }
    catch (error) {
        throw toOcrError(error);
    }
}
