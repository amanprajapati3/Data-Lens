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
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
}));
app.use(express_1.default.json({
    limit: "10kb",
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
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
