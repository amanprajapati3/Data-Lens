import { Request, Response } from "express";

import {
  extractOcrText,
  OcrExtractionError,
} from "../services/ocr.service";

import {
  detectImageMimeType,
  isSupportedImageBuffer,
} from "../services/image-validation.service";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_LABEL,
} from "../types/image.types";

import { OCR_FIELD_NAME } from "../types/ocr.types";

/**
 * Extract structured text from one
 * uploaded image or PDF page.
 *
 * POST /api/ocr-extract
 *
 * Expects multipart/form-data with a
 * single "image" field.
 */
export async function ocrExtractController(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: `No file was uploaded. Send one image in the "${OCR_FIELD_NAME}" field as multipart/form-data.`,
      });
    }

    if (!file.buffer || file.size === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is empty",
      });
    }

    const mimeType = file.mimetype.toLowerCase().trim();

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type "${file.mimetype}". Allowed types: JPEG, PNG, WEBP.`,
      });
    }

    if (!isSupportedImageBuffer(file.buffer)) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid JPEG, PNG or WEBP image",
      });
    }

    const detectedMimeType = detectImageMimeType(file.buffer);

    const text = await extractOcrText({
      buffer: file.buffer,
      mimetype: detectedMimeType ?? mimeType,
    });

    return res.status(200).json({
      success: true,
      data: {
        text,
      },
    });
  } catch (error) {
    console.error("OCR extract controller error:", error);

    if (error instanceof OcrExtractionError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : `Unable to extract text from the image. Maximum size is ${MAX_IMAGE_SIZE_LABEL}.`,
    });
  }
}
