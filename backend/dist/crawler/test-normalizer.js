"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_normalizer_1 = require("./url-normalizer");
const rootUrl = new URL("https://example.com");
const testUrls = [
    "/about",
    "/about/",
    "/about#team",
    "https://example.com/services",
    "https://example.com/blog/",
    "https://google.com",
    "mailto:test@example.com",
    "javascript:void(0)",
];
for (const input of testUrls) {
    const normalized = (0, url_normalizer_1.normalizeUrl)(input, rootUrl.href);
    if (!normalized) {
        console.log(`IGNORED: ${input}`);
        continue;
    }
    const internal = (0, url_normalizer_1.isSameOrigin)(normalized, rootUrl);
    console.log(`${input} → ${normalized.href} → ${internal
        ? "INTERNAL"
        : "EXTERNAL"}`);
}
