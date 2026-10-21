import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  jsonEditController,
} from "../controllers/json-edit.controller";

const router = Router();

/*
 * Every request sends the full document to
 * Gemini, so the limit stays close to the
 * image extraction limiter.
 */
const editLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many AI edit requests. Please try again later.",
  },
});

/*
 * Edit a JSON document with Gemini.
 *
 * POST /api/json-edit
 *
 * Content-Type: application/json
 *
 * Fields: json (any JSON value),
 * instruction (string)
 */
router.post(
  "/",
  editLimiter,
  jsonEditController
);

export default router;
