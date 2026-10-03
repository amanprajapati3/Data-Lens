"use strict";
/**
 * Shared image content checks.
 *
 * The browser supplied Content-Type is
 * client controlled, so the declared MIME
 * type is never proof that the bytes are
 * really an image. These helpers check the
 * file signature (magic bytes) instead.
 *
 * Used by both the upload middleware and the
 * controller so the rule exists once.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectImageMimeType = detectImageMimeType;
exports.isSupportedImageBuffer = isSupportedImageBuffer;
const image_types_1 = require("../types/image.types");
/*
 * File signatures for the formats the
 * model accepts.
 *
 * - JPEG starts with FF D8 FF
 * - PNG starts with the 8 byte signature
 * - WEBP is a RIFF container whose form
 *   type at offset 8 is "WEBP"
 */
const PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a,
    0x0a,
]);
const RIFF_SIGNATURE = Buffer.from("RIFF");
const WEBP_SIGNATURE = Buffer.from("WEBP");
const JPEG_SIGNATURE = Buffer.from([
    0xff, 0xd8, 0xff,
]);
/**
 * Detect the real image format from the
 * file signature.
 *
 * Returns a MIME type, or null when the
 * bytes are not a supported image.
 */
function detectImageMimeType(buffer) {
    if (buffer.length === 0) {
        return null;
    }
    if (buffer.length >= JPEG_SIGNATURE.length &&
        buffer.subarray(0, 3).equals(JPEG_SIGNATURE)) {
        return "image/jpeg";
    }
    if (buffer.length >= PNG_SIGNATURE.length &&
        buffer
            .subarray(0, PNG_SIGNATURE.length)
            .equals(PNG_SIGNATURE)) {
        return "image/png";
    }
    if (buffer.length >= 12 &&
        buffer
            .subarray(0, 4)
            .equals(RIFF_SIGNATURE) &&
        buffer
            .subarray(8, 12)
            .equals(WEBP_SIGNATURE)) {
        return "image/webp";
    }
    return null;
}
/**
 * True when the bytes really are one of
 * the supported image formats.
 */
function isSupportedImageBuffer(buffer) {
    const detected = detectImageMimeType(buffer);
    if (!detected) {
        return false;
    }
    return image_types_1.ALLOWED_IMAGE_MIME_TYPES.includes(detected);
}
