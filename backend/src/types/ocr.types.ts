/**
 * Types and limits for the OCR
 * extraction feature.
 *
 * POST /api/ocr-extract
 *
 * A single page is uploaded as an image
 * and returned as structured Markdown.
 */

export const OCR_FIELD_NAME = "image";

export const MAX_OCR_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_OCR_IMAGE_SIZE_LABEL = "5 MB";

/*
 * The model used to read text from the
 * uploaded page.
 */
export const OCR_MODEL = "gemini-2.5-flash";

/*
 * Dense pages can produce long Markdown,
 * so the cap is high enough to fit a full
 * page of text without truncating it.
 */
export const OCR_MAX_OUTPUT_TOKENS = 16_000;

export interface OcrResult {
  /**
   * Structured Markdown that mirrors the
   * hierarchy and layout of the page.
   */
  text: string;
}
