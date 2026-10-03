import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  imageExtractController,
} from "../controllers/image.controller";

import { uploadImage } from "../middleware/upload.middleware";

const router = Router();

/*
 * Each request sends a full base64 image
 * to Gemini, so the limit is tighter than
 * the crawler limit and the window is
 * wider.
 */
const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many image extraction requests. Please try again later.",
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
router.post(
  "/",
  imageLimiter,
  uploadImage,
  imageExtractController
);

export default router;
