"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.isSameOrigin = isSameOrigin;
function normalizeUrl(input, baseUrl) {
    try {
        const url = new URL(input, baseUrl);
        /*
         * Only HTTP and HTTPS URLs.
         */
        if (url.protocol !== "http:" &&
            url.protocol !== "https:") {
            return null;
        }
        /*
         * Remove the fragment.
         *
         * /about#team
         * becomes
         * /about
         */
        url.hash = "";
        /*
         * Remove the default ports.
         */
        if ((url.protocol === "http:" &&
            url.port === "80") ||
            (url.protocol === "https:" &&
                url.port === "443")) {
            url.port = "";
        }
        /*
         * Remove trailing slash except for homepage.
         */
        if (url.pathname.length > 1 &&
            url.pathname.endsWith("/")) {
            url.pathname =
                url.pathname.slice(0, -1);
        }
        return url;
    }
    catch {
        return null;
    }
}
function isSameOrigin(targetUrl, rootUrl) {
    return (targetUrl.protocol ===
        rootUrl.protocol &&
        targetUrl.hostname ===
            rootUrl.hostname &&
        targetUrl.port ===
            rootUrl.port);
}
