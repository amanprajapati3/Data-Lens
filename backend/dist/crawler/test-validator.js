"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_validator_1 = require("./url-validator");
async function test() {
    const urls = [
        "https://example.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.1",
        "ftp://example.com",
        "file:///etc/passwd",
    ];
    for (const input of urls) {
        try {
            const result = await (0, url_validator_1.validateTargetUrl)(input);
            console.log(`ALLOWED: ${input} → ${result.href}`);
        }
        catch (error) {
            console.log(`BLOCKED: ${input} → ${error instanceof Error
                ? error.message
                : "Unknown error"}`);
        }
    }
}
test();
