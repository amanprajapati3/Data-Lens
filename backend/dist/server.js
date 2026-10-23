"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const crawl_routes_1 = __importDefault(require("./routes/crawl.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const image_routes_1 = __importDefault(require("./routes/image.routes"));
const json_edit_routes_1 = __importDefault(require("./routes/json-edit.routes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = (process.env.CORS_ORIGIN ?? "https://data-lens-ruby.vercel.app/")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
/*
 * Local development runs on a random
 * localhost port, so any loopback origin is
 * accepted while NODE_ENV is not production.
 */
const isDevelopment = process.env.NODE_ENV !== "production";
const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;
function isAllowedOrigin(origin) {
    return (allowedOrigins.includes(origin) ||
        (isDevelopment && localOriginPattern.test(origin)));
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
}));
/*
 * 1 MB so a full extraction result can be
 * sent back for an AI edit without tripping
 * the body parser.
 */
app.use(express_1.default.json({
    limit: "1mb",
}));
/*
 * Health check
 */
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Website extractor API is running",
    });
});
/*
 * Website crawler
 */
app.use("/api/crawl", crawl_routes_1.default);
app.use("/api/export", export_routes_1.default);
/*
 * Image extraction
 *
 * Mounted after express.json() because
 * this route reads multipart/form-data,
 * which express.json() does not parse.
 */
app.use("/api/image-extract", image_routes_1.default);
/*
 * OCR text extraction
 *
 * Also multipart/form-data, so it is
 * mounted next to the image route.
 */
app.use("/api/ocr-extract", ocr_routes_1.default);
/*
 * AI JSON editing
 *
 * Mounted after express.json() because the
 * route reads an application/json body.
 */
app.use("/api/json-edit", json_edit_routes_1.default);
const port = Number(process.env.PORT) || 5000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
