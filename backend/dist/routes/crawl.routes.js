"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const crawl_controller_1 = require("../controllers/crawl.controller");
const crawl_concurrency_1 = require("../middleware/crawl-concurrency");
const router = (0, express_1.Router)();
const crawlLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many crawl requests. Please try again later.",
    },
});
router.post("/", crawlLimiter, crawl_controller_1.crawlController, crawl_concurrency_1.crawlConcurrency);
exports.default = router;
