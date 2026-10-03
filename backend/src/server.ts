import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import crawlRoutes from "./routes/crawl.routes";
import exportRoutes from "./routes/export.routes";
import imageRoutes from "./routes/image.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(
  express.json({
    limit: "10kb",
  })
);

/*
 * Health check
 */
app.get("/api/health", (_req, res) => {
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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});