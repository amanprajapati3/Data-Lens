"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const image_controller_1 = require("../controllers/image.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
/*
 * Each request sends a full base64 image
 * to Gemini, so the limit is tighter than
 * the crawler limit and the window is
 * wider.
 */
const imageLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many image extraction requests. Please try again later.",
    },
});
/*
 * Extract website data from an
 * uploaded screenshot.
 *
 * POST /api/image-extract
 *
 * Content-Type: multipart/form-data
 *
 * Field: image (JPEG, PNG or WEBP,
 * maximum 5 MB)
 */
router.post("/", imageLimiter, upload_middleware_1.uploadImage, image_controller_1.imageExtractController);
exports.default = router;
