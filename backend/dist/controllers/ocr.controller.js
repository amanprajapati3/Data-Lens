"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrExtractController = ocrExtractController;
const ocr_service_1 = require("../services/ocr.service");
const image_validation_service_1 = require("../services/image-validation.service");
const image_types_1 = require("../types/image.types");
const ocr_types_1 = require("../types/ocr.types");
/**
 * Extract structured text from one
 * uploaded image or PDF page.
 *
 * POST /api/ocr-extract
 *
 * Expects multipart/form-data with a
 * single "image" field.
 */
async function ocrExtractController(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: `No file was uploaded. Send one image in the "${ocr_types_1.OCR_FIELD_NAME}" field as multipart/form-data.`,
            });
        }
        if (!file.buffer || file.size === 0) {
            return res.status(400).json({
                success: false,
                message: "The uploaded file is empty",
            });
        }
        const mimeType = file.mimetype.toLowerCase().trim();
        if (!image_types_1.ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
            return res.status(400).json({
                success: false,
                message: `Unsupported file type "${file.mimetype}". Allowed types: JPEG, PNG, WEBP.`,
            });
        }
        if (!(0, image_validation_service_1.isSupportedImageBuffer)(file.buffer)) {
            return res.status(400).json({
                success: false,
                message: "The uploaded file is not a valid JPEG, PNG or WEBP image",
            });
        }
        const detectedMimeType = (0, image_validation_service_1.detectImageMimeType)(file.buffer);
        const text = await (0, ocr_service_1.extractOcrText)({
            buffer: file.buffer,
            mimetype: detectedMimeType ?? mimeType,
        });
        return res.status(200).json({
            success: true,
            data: {
                text,
            },
        });
    }
    catch (error) {
        console.error("OCR extract controller error:", error);
        if (error instanceof ocr_service_1.OcrExtractionError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : `Unable to extract text from the image. Maximum size is ${image_types_1.MAX_IMAGE_SIZE_LABEL}.`,
        });
    }
}
