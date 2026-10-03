import { Router } from "express";

import {
  exportJsonController,
  exportZipController,
  exportPageController,
} from "../controllers/export.controller";

const router = Router();

/*
 * Download complete website JSON.
 *
 * GET /api/export/:jobId/json
 */
router.get(
  "/:jobId/json",
  exportJsonController
);

/*
 * Download complete website ZIP.
 *
 * GET /api/export/:jobId/zip
 */
router.get(
  "/:jobId/zip",
  exportZipController
);

/*
 * Download one individual page.
 *
 * GET /api/export/:jobId/page?url=...
 */
router.get(
  "/:jobId/page",
  exportPageController
);

export default router;