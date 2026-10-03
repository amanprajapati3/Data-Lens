"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_fetcher_1 = require("../crawler/http-fetcher");
const page_extractor_1 = require("./page.extractor");
async function test() {
    try {
        const page = await (0, http_fetcher_1.fetchPage)("https://example.com");
        const data = (0, page_extractor_1.extractPageData)(page.body, page.url);
        console.log(JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error("EXTRACTION ERROR:", error instanceof Error
            ? error.message
            : error);
    }
}
test();
