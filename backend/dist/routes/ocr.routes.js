"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ocr_controller_1 = require("../controllers/ocr.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
/*
 * Every page is read by Gemini, and a PDF
 * sends one request per page. Keep the
 * limit generous enough for a short PDF
 * while still protecting the API.
 */
const ocrLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OCR requests. Please try again later.",
    },
});
/*
 * POST /api/ocr-extract
 *
 * Content-Type: multipart/form-data
 *
 * Field: image (JPEG, PNG or WEBP,
 * maximum 5 MB)
 */
router.post("/", ocrLimiter, upload_middleware_1.uploadImage, ocr_controller_1.ocrExtractController);
exports.default = router;
