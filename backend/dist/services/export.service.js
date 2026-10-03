"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFullJson = createFullJson;
exports.createPageJson = createPageJson;
exports.sendSingleJson = sendSingleJson;
exports.sendZip = sendZip;
exports.findPage = findPage;
exports.sendPageJson = sendPageJson;
function safeFileName(value) {
    return value
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
}
function getPageFileName(pageUrl) {
    try {
        const url = new URL(pageUrl);
        let pathname = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
        if (!pathname) {
            pathname = "home";
        }
        /*
         * Include query parameters if they exist.
         */
        if (url.search) {
            pathname +=
                "-" + url.search.replace("?", "").replace(/[^a-zA-Z0-9-_]/g, "-");
        }
        return (safeFileName(pathname) || "page") + ".json";
    }
    catch {
        return "page.json";
    }
}
/**
 * Create JSON string for the
 * complete website.
 */
function createFullJson(websiteData) {
    return JSON.stringify(websiteData, null, 2);
}
/**
 * Create JSON string for
 * one individual page.
 */
function createPageJson(page) {
    return JSON.stringify(page, null, 2);
}
/**
 * Create one JSON file in
 * the HTTP response.
 */
function sendSingleJson(websiteData, res) {
    const domain = safeFileName(websiteData.website.domain) || "website";
    const fileName = `${domain}-data.json`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(createFullJson(websiteData));
}
/**
 * Create a ZIP containing:
 *
 * website.json
 * pages/*.json
 * summary.json
 */
async function sendZip(websiteData, res) {
    const domain = safeFileName(websiteData.website.domain) || "website";
    const fileName = `${domain}-data.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    /*
     * archiver v8 is ESM-only. This project compiles to CommonJS, so a static
     * "import { ZipArchive }" resolves to undefined at runtime. A dynamic import
     * is the only form that yields the real ZipArchive class here.
     */
    const { ZipArchive } = await import("archiver");
    const archive = new ZipArchive({
        zlib: { level: 9 },
    });
    const fail = (error) => {
        console.error("ZIP archive error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to create ZIP export",
            });
        }
        else {
            res.destroy(error);
        }
    };
    archive.on("error", fail);
    archive.on("warning", (warning) => {
        console.warn("ZIP archive warning:", warning);
    });
    archive.pipe(res);
    archive.append(JSON.stringify(websiteData, null, 2), {
        name: "website.json",
    });
    const usedNames = new Map();
    for (const page of websiteData.pages) {
        const baseName = getPageFileName(page.url);
        const count = usedNames.get(baseName) ?? 0;
        usedNames.set(baseName, count + 1);
        const pageFileName = count === 0 ? baseName : baseName.replace(/\.json$/, `-${count}.json`);
        archive.append(createPageJson(page), {
            name: `pages/${pageFileName}`,
        });
    }
    archive.append(JSON.stringify(websiteData.summary, null, 2), {
        name: "summary.json",
    });
    archive.finalize().catch(fail);
}
/**
 * Find one page by URL.
 */
function findPage(websiteData, pageUrl) {
    return websiteData.pages.find((page) => page.url === pageUrl) || null;
}
/**
 * Send one selected page
 * as a downloadable JSON file.
 */
function sendPageJson(websiteData, pageUrl, res) {
    const page = findPage(websiteData, pageUrl);
    if (!page) {
        res.status(404).json({
            success: false,
            message: "Requested page was not found.",
        });
        return;
    }
    const fileName = getPageFileName(page.url);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(createPageJson(page));
}
