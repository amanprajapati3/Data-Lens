import { Router } from "express";
import rateLimit from "express-rate-limit";
import { crawlController } from "../controllers/crawl.controller";
import { crawlConcurrency } from "../middleware/crawl-concurrency";

const router = Router();

const crawlLimiter =
  rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message:
        "Too many crawl requests. Please try again later.",
    },
  });

router.post(
  "/",
  crawlLimiter,
  crawlController,
  crawlConcurrency
);

export default router;