"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedImageTypeError = void 0;
exports.uploadImage = uploadImage;
const multer_1 = __importDefault(require("multer"));
const image_types_1 = require("../types/image.types");
/**
 * Raised when the uploaded file is not
 * one of the supported image formats.
 *
 * Multer propagates this error out of the
 * file filter, and the wrapper below turns
 * it into a normal JSON response.
 */
class UnsupportedImageTypeError extends Error {
    constructor(mimeType) {
        super(`Unsupported image type "${mimeType}". Allowed types: JPEG, PNG, WEBP.`);
        this.name = "UnsupportedImageTypeError";
    }
}
exports.UnsupportedImageTypeError = UnsupportedImageTypeError;
/*
 * Images are held in memory only.
 *
 * Nothing is written to disk, so an
 * uploaded screenshot disappears as soon
 * as the request finishes.
 */
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: image_types_1.MAX_IMAGE_SIZE_BYTES,
        files: 1,
        fields: 10,
        parts: 12,
    },
    fileFilter: (_req, file, callback) => {
        /*
         * Normalise the type because some
         * clients send "image/jpg".
         */
        const mimeType = file.mimetype.toLowerCase().trim();
        if (!image_types_1.ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
            callback(new UnsupportedImageTypeError(file.mimetype));
            return;
        }
        /*
         * memoryStorage makes the bytes
         * available here, so the real format can
         * be confirmed before the request goes
         * any further.
         */
        callback(null, true);
    },
});
const acceptImage = upload.single(image_types_1.IMAGE_FIELD_NAME);
/**
 * Translate a multer error into the
 * API error envelope.
 *
 * The project has no shared error
 * middleware, so the upload wrapper
 * responds directly instead of passing
 * the error down the chain.
 */
function sendUploadError(error, res) {
    if (error instanceof UnsupportedImageTypeError) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
        return;
    }
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({
                success: false,
                message: `Image is too large. Maximum size is ${image_types_1.MAX_IMAGE_SIZE_LABEL}.`,
            });
            return;
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            res.status(400).json({
                success: false,
                message: `Unexpected file field "${error.field ?? "unknown"}". Upload one file using the "${image_types_1.IMAGE_FIELD_NAME}" field.`,
            });
            return;
        }
        res.status(400).json({
            success: false,
            message: `Unable to read the uploaded image: ${error.message}`,
        });
        return;
    }
    /*
     * A malformed multipart body reaches
     * this point.
     */
    console.error("Image upload middleware error:", error);
    const details = error instanceof Error && error.message
        ? ` ${error.message}.`
        : "";
    res.status(400).json({
        success: false,
        message: `Invalid multipart/form-data request.${details} Send one file in the "${image_types_1.IMAGE_FIELD_NAME}" form-data field and let the client set the Content-Type boundary.`,
    });
}
/**
 * Accept one image from the
 * "image" form field.
 *
 * The parsed file is exposed on
 * `req.file`.
 */
function uploadImage(req, res, next) {
    const contentType = req.get("content-type") ?? "";
    if (/^multipart\/form-data(?:\s*;|$)/i.test(contentType) &&
        !/\bboundary=(?:"[^"]+"|[^;\s]+)/i.test(contentType)) {
        res.status(400).json({
            success: false,
            message: `Multipart form-data is missing its boundary. In Postman, choose Body > form-data, add the "${image_types_1.IMAGE_FIELD_NAME}" file field, and remove any manually added Content-Type header.`,
        });
        return;
    }
    acceptImage(req, res, (error) => {
        if (error) {
            sendUploadError(error, res);
            return;
        }
        next();
    });
}
