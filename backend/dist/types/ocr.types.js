"use strict";
/**
 * Types and limits for the OCR
 * extraction feature.
 *
 * POST /api/ocr-extract
 *
 * A single page is uploaded as an image
 * and returned as structured Markdown.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCR_MAX_OUTPUT_TOKENS = exports.OCR_MODEL = exports.MAX_OCR_IMAGE_SIZE_LABEL = exports.MAX_OCR_IMAGE_SIZE_BYTES = exports.OCR_FIELD_NAME = void 0;
exports.OCR_FIELD_NAME = "image";
exports.MAX_OCR_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
exports.MAX_OCR_IMAGE_SIZE_LABEL = "5 MB";
/*
 * The model used to read text from the
 * uploaded page.
 */
exports.OCR_MODEL = "gemini-2.5-flash";
/*
 * Dense pages can produce long Markdown,
 * so the cap is high enough to fit a full
 * page of text without truncating it.
 */
exports.OCR_MAX_OUTPUT_TOKENS = 16_000;
