"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlController = crawlController;
const crawler_1 = require("../crawler/crawler");
const job_store_1 = require("../jobs/job.store");
async function crawlController(req, res) {
    try {
        const body = req.body;
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
        const result = await (0, crawler_1.crawlWebsite)(url);
        /*
         * Store the complete crawl result
         * on the backend.
         *
         * Only the job ID will be returned
         * to the client.
         */
        const jobId = (0, job_store_1.createJob)(result.website);
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
    }
    catch (error) {
        console.error("Crawl controller error:", error);
        const message = error instanceof Error ? error.message : "Unable to crawl website";
        return res.status(400).json({
            success: false,
            message,
        });
    }
}
