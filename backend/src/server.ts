import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import crawlRoutes from "./routes/crawl.routes";
import exportRoutes from "./routes/export.routes";
import imageRoutes from "./routes/image.routes";
import jsonEditRoutes from "./routes/json-edit.routes";
import ocrRoutes from "./routes/ocr.routes";

const app = express();

app.use(helmet());

const allowedOrigins = (
  process.env.CORS_ORIGIN ?? "https://data-lens-ruby.vercel.app/"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

/*
 * Local development runs on a random
 * localhost port, so any loopback origin is
 * accepted while NODE_ENV is not production.
 */
const isDevelopment = process.env.NODE_ENV !== "production";
const localOriginPattern =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

function isAllowedOrigin(origin: string) {
  return (
    allowedOrigins.includes(origin) ||
    (isDevelopment && localOriginPattern.test(origin))
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);

/*
 * 1 MB so a full extraction result can be
 * sent back for an AI edit without tripping
 * the body parser.
 */
app.use(
  express.json({
    limit: "1mb",
  })
);

/*
 * Health check
 */
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message:
      "Website extractor API is running",
  });
});

/*
 * Website crawler
 */
app.use(
  "/api/crawl",
  crawlRoutes
);

app.use(
  "/api/export",
  exportRoutes
);

/*
 * Image extraction
 *
 * Mounted after express.json() because
 * this route reads multipart/form-data,
 * which express.json() does not parse.
 */
app.use(
  "/api/image-extract",
  imageRoutes
);

/*
 * OCR text extraction
 *
 * Also multipart/form-data, so it is
 * mounted next to the image route.
 */
app.use(
  "/api/ocr-extract",
  ocrRoutes
);

/*
 * AI JSON editing
 *
 * Mounted after express.json() because the
 * route reads an application/json body.
 */
app.use(
  "/api/json-edit",
  jsonEditRoutes
);

const port = Number(process.env.PORT) || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});