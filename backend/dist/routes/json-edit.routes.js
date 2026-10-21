"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const json_edit_controller_1 = require("../controllers/json-edit.controller");
const router = (0, express_1.Router)();
/*
 * Every request sends the full document to
 * Gemini, so the limit stays close to the
 * image extraction limiter.
 */
const editLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many AI edit requests. Please try again later.",
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
router.post("/", editLimiter, json_edit_controller_1.jsonEditController);
exports.default = router;
