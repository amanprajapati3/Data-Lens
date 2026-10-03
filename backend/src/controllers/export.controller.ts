import { Request, Response } from "express";

import {
  sendSingleJson,
  sendZip,
  createPageJson,
  findPage,
} from "../services/export.service";

import { getJob } from "../jobs/job.store";

/**
 * Download complete website
 * as one JSON file.
 */
export function exportJsonController(req: Request, res: Response) {
  try {
    const jobId = getJobId(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    /*
     * Retrieve crawl result
     * from temporary storage.
     */
    const websiteData = getJob(jobId);

    if (!websiteData) {
      return res.status(404).json({
        success: false,
        message: "Job not found or has expired",
      });
    }

    /*
     * Generate downloadable JSON.
     */
    sendSingleJson(websiteData, res);
  } catch (error) {
    console.error("JSON export error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate JSON file",
    });
  }
}

/**
 * Download complete website
 * as a ZIP file.
 */
export async function exportZipController(req: Request, res: Response) {
  try {
    const jobId = getJobId(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    /*
     * Retrieve crawl result.
     */
    const websiteData = getJob(jobId);

    if (!websiteData) {
      return res.status(404).json({
        success: false,
        message: "Job not found or has expired",
      });
    }

    /*
     * Generate ZIP.
     */
    await sendZip(websiteData, res);
  } catch (error) {
    console.error("ZIP export error:", error);

    if (res.headersSent) {
      return res.destroy(error as Error);
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate ZIP file",
    });
  }
}

/**
 * Download one individual page
 * as JSON.
 */
export function exportPageController(req: Request, res: Response) {
  try {
    const jobId = getJobId(req.params.jobId);
    const pageUrl = req.query.url;

    /*
     * Validate job ID.
     */
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    /*
     * Validate page URL.
     */
    if (typeof pageUrl !== "string" || !pageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Page URL is required",
      });
    }

    /*
     * Retrieve website data.
     */
    const websiteData = getJob(jobId);

    if (!websiteData) {
      return res.status(404).json({
        success: false,
        message: "Job not found or has expired",
      });
    }

    /*
     * Find the page inside the
     * crawled website.
     */
    const page = findPage(websiteData, pageUrl);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Requested page was not found",
      });
    }

    /*
     * Convert page to JSON.
     */
    const json = createPageJson(page);

    /*
     * Create safe filename.
     */
    let fileName = "page-data.json";

    try {
      const url = new URL(page.url);

      let pathname = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "");

      if (!pathname) {
        pathname = "home";
      }

      pathname = pathname
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      fileName = `${pathname || "page"}.json`;
    } catch {
      // Use default filename.
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(json);
  } catch (error) {
    console.error("Page JSON export error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate page JSON file",
    });
  }
}
function getJobId(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const jobId = value.trim();

  if (!jobId) {
    return null;
  }

  return jobId;
}
