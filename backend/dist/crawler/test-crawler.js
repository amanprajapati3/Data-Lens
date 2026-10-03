"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crawler_1 = require("./crawler");
async function test() {
    try {
        const result = await (0, crawler_1.crawlWebsite)("https://movie-book-eta.vercel.app/");
        console.log("\n====================");
        console.log("CRAWL COMPLETE");
        console.log("====================\n");
        console.log("Start URL:", result.website.website.url);
        console.log("Domain:", result.website.website.domain);
        console.log("Crawled At:", result.website.website.crawledAt);
        console.log("Pages discovered:", result.website.summary.pagesDiscovered);
        console.log("Pages crawled:", result.website.summary.pagesCrawled);
        console.log("Total links:", result.website.summary.totalLinks);
        console.log("Total images:", result.website.summary.totalImages);
        console.log("Pages failed:", result.website.summary.pagesFailed);
        console.log("\nCrawled pages:");
        for (const page of result.website.pages) {
            console.log(`- ${page.url}`);
        }
        if (result.failedUrls.length > 0) {
            console.log("\nFailed URLs:");
            for (const failed of result.failedUrls) {
                console.log(`- ${failed.url}`);
                console.log(`  ${failed.error}`);
            }
        }
    }
    catch (error) {
        console.error("CRAWL ERROR:", error instanceof Error
            ? error.message
            : error);
    }
}
test();
