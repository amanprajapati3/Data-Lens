"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_fetcher_1 = require("./http-fetcher");
async function test() {
    try {
        console.log("Testing request timeout...");
        await (0, http_fetcher_1.fetchPage)("https://httpstat.us/200?sleep=15000");
        console.log("ERROR: Request did not timeout");
    }
    catch (error) {
        console.log("\nResult:");
        console.log(error instanceof Error
            ? error.message
            : error);
    }
}
test();
