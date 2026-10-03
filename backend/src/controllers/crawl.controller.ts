import { Request, Response } from "express";

import { crawlWebsite } from "../crawler/crawler";
import { createJob } from "../jobs/job.store";

interface CrawlRequestBody {
  url?: unknown;
}

export async function crawlController(req: Request, res: Response) {
  try {
    const body = req.body as CrawlRequestBody;

    /*
     * Basic request validation.
     */
    if (typeof body.url !== "string" || body.url.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "A valid URL is required",
      });
    }

    const url = body.url.trim();

    /*
     * Crawl the website.
     *
     * The crawler itself performs the
     * security validation before making
     * requests.
     */
    const result = await crawlWebsite(url);

    /*
     * Store the complete crawl result
     * on the backend.
     *
     * Only the job ID will be returned
     * to the client.
     */
    const jobId = createJob(result.website);

    /*
     * Return a small response.
     *
     * We intentionally DO NOT return
     * the complete WebsiteData here.
     */
    return res.status(200).json({
      success: true,
      jobId,
      data: {
        website: result.website.website,
        summary: result.website.summary,
        failedUrls: result.failedUrls,
      },
    });
  } catch (error) {
    console.error("Crawl controller error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to crawl website";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
