"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_fetcher_1 = require("./http-fetcher");
async function test() {
    try {
        const result = await (0, http_fetcher_1.fetchPage)("https://example.com");
        console.log("URL:", result.url);
        console.log("Status:", result.status);
        console.log("Content-Type:", result.contentType);
        console.log("HTML length:", result.body.length);
        console.log("\nFirst 300 characters:\n");
        console.log(result.body.slice(0, 300));
    }
    catch (error) {
        console.error("FETCH ERROR:", error instanceof Error
            ? error.message
            : error);
    }
}
test();
