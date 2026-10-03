"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crawler_1 = require("../crawler/crawler");
async function test() {
    try {
        console.log("Starting website crawl...");
        const result = await (0, crawler_1.crawlWebsite)("https://movie-book-eta.vercel.app/");
        const websiteData = result.website;
        /*
         * Create local test directory.
         */
        const outputDir = path_1.default.join(process.cwd(), "test-output");
        fs_1.default.mkdirSync(outputDir, {
            recursive: true,
        });
        /*
         * -----------------------------
         * TEST SINGLE JSON
         * -----------------------------
         */
        const jsonPath = path_1.default.join(outputDir, "website-data.json");
        fs_1.default.writeFileSync(jsonPath, JSON.stringify(websiteData, null, 2), "utf-8");
        console.log("\nJSON file created:");
        console.log(jsonPath);
        /*
         * -----------------------------
         * TEST DATA
         * -----------------------------
         */
        console.log("\nExport data:");
        console.log("Domain:", websiteData.website.domain);
        console.log("Pages:", websiteData.pages.length);
        console.log("Links:", websiteData.summary.totalLinks);
        console.log("Images:", websiteData.summary.totalImages);
        console.log("\nJSON export test passed.");
    }
    catch (error) {
        console.error("\nEXPORT TEST FAILED:");
        console.error(error);
    }
}
test();
