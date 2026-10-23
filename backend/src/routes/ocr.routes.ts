import { Router } from "express";
import rateLimit from "express-rate-limit";

import { ocrExtractController } from "../controllers/ocr.controller";
import { uploadImage } from "../middleware/upload.middleware";

const router = Router();

/*
 * Every page is read by Gemini, and a PDF
 * sends one request per page. Keep the
 * limit generous enough for a short PDF
 * while still protecting the API.
 */
const ocrLimiter = rateLimit({
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
router.post("/", ocrLimiter, uploadImage, ocrExtractController);

export default router;
