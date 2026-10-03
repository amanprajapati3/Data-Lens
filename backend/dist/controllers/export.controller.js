"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportJsonController = exportJsonController;
exports.exportZipController = exportZipController;
exports.exportPageController = exportPageController;
const export_service_1 = require("../services/export.service");
const job_store_1 = require("../jobs/job.store");
/**
 * Download complete website
 * as one JSON file.
 */
function exportJsonController(req, res) {
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
        const websiteData = (0, job_store_1.getJob)(jobId);
        if (!websiteData) {
            return res.status(404).json({
                success: false,
                message: "Job not found or has expired",
            });
        }
        /*
         * Generate downloadable JSON.
         */
        (0, export_service_1.sendSingleJson)(websiteData, res);
    }
    catch (error) {
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
async function exportZipController(req, res) {
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
        const websiteData = (0, job_store_1.getJob)(jobId);
        if (!websiteData) {
            return res.status(404).json({
                success: false,
                message: "Job not found or has expired",
            });
        }
        /*
         * Generate ZIP.
         */
        await (0, export_service_1.sendZip)(websiteData, res);
    }
    catch (error) {
        console.error("ZIP export error:", error);
        if (res.headersSent) {
            return res.destroy(error);
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
function exportPageController(req, res) {
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
        const websiteData = (0, job_store_1.getJob)(jobId);
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
        const page = (0, export_service_1.findPage)(websiteData, pageUrl);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Requested page was not found",
            });
        }
        /*
         * Convert page to JSON.
         */
        const json = (0, export_service_1.createPageJson)(page);
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
        }
        catch {
            // Use default filename.
        }
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.status(200).send(json);
    }
    catch (error) {
        console.error("Page JSON export error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to generate page JSON file",
        });
    }
}
function getJobId(value) {
    if (typeof value !== "string") {
        return null;
    }
    const jobId = value.trim();
    if (!jobId) {
        return null;
    }
    return jobId;
}
