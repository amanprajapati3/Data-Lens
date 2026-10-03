"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const router = (0, express_1.Router)();
/*
 * Download complete website JSON.
 *
 * GET /api/export/:jobId/json
 */
router.get("/:jobId/json", export_controller_1.exportJsonController);
/*
 * Download complete website ZIP.
 *
 * GET /api/export/:jobId/zip
 */
router.get("/:jobId/zip", export_controller_1.exportZipController);
/*
 * Download one individual page.
 *
 * GET /api/export/:jobId/page?url=...
 */
router.get("/:jobId/page", export_controller_1.exportPageController);
exports.default = router;
