"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageExtractController = imageExtractController;
const image_extraction_service_1 = require("../services/image-extraction.service");
const image_validation_service_1 = require("../services/image-validation.service");
const image_types_1 = require("../types/image.types");
/**
 * Extract website data from one
 * uploaded screenshot.
 *
 * POST /api/image-extract
 *
 * Expects multipart/form-data with a
 * single "image" field.
 */
async function imageExtractController(req, res) {
    try {
        const file = req.file;
        /*
         * No file reached the controller.
         *
         * This happens when the request is not
         * multipart at all, when the body is
         * empty, or when the field is missing.
         */
        if (!file) {
            return res.status(400).json({
                success: false,
                message: `No image was uploaded. Send one file in the "${image_types_1.IMAGE_FIELD_NAME}" field as multipart/form-data.`,
            });
        }
        if (!file.buffer || file.size === 0) {
            return res.status(400).json({
                success: false,
                message: "The uploaded image is empty",
            });
        }
        const mimeType = file.mimetype
            .toLowerCase()
            .trim();
        /*
         * Re-verify type and magic bytes in case
         * multer was bypassed or the file was
         * modified in transit.
         */
        if (!image_types_1.ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
            return res.status(400).json({
                success: false,
                message: `Unsupported image type "${file.mimetype}". Allowed types: JPEG, PNG, WEBP.`,
            });
        }
        /*
         * Confirm the bytes really are a
         * supported image. The declared
         * Content-Type is client controlled.
         */
        if (!(0, image_validation_service_1.isSupportedImageBuffer)(file.buffer)) {
            return res.status(400).json({
                success: false,
                message: "The uploaded file is not a valid JPEG, PNG or WEBP image",
            });
        }
        /*
         * Use the type detected from the file
         * signature rather than the declared one.
         */
        const detectedMimeType = (0, image_validation_service_1.detectImageMimeType)(file.buffer);
        /*
         * Analyse the screenshot with Gemini.
         */
        const data = await (0, image_extraction_service_1.extractImageData)({
            buffer: file.buffer,
            mimetype: detectedMimeType ?? mimeType,
        });
        /*
         * The buffer goes out of scope here,
         * so the image is never written to
         * disk and never persisted.
         */
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("Image extract controller error:", error);
        /*
         * Service errors already carry the
         * status code that fits the failure.
         */
        if (error instanceof image_extraction_service_1.ImageExtractionError) {
            return res
                .status(error.statusCode)
                .json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : `Unable to extract data from the image. Maximum size is ${image_types_1.MAX_IMAGE_SIZE_LABEL}.`,
        });
    }
}
