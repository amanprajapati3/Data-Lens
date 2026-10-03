"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlWebsite = crawlWebsite;
const http_fetcher_1 = require("./http-fetcher");
const url_normalizer_1 = require("./url-normalizer");
const url_validator_1 = require("./url-validator");
const page_extractor_1 = require("../extractor/page.extractor");
const MAX_PAGES = 20;
const MAX_CONCURRENT_REQUESTS = 2;
async function crawlWebsite(startUrl) {
    /*
     * Validate the starting URL first.
     */
    const rootUrl = await (0, url_validator_1.validateTargetUrl)(startUrl);
    /*
     * Queue containing URLs waiting to be crawled.
     */
    const queue = [rootUrl.href];
    /*
     * Prevent duplicate crawling.
     */
    const queuedUrls = new Set([rootUrl.href]);
    const crawledUrls = new Set();
    const finalUrls = new Set();
    const pages = [];
    const failedUrls = [];
    /*
     * Process the queue with limited concurrency.
     */
    async function worker() {
        while (true) {
            /*
             * Stop if we've reached the page limit.
             */
            if (crawledUrls.size >= MAX_PAGES) {
                return;
            }
            const nextUrl = queue.shift();
            if (!nextUrl) {
                return;
            }
            /*
             * Prevent duplicate processing.
             */
            if (crawledUrls.has(nextUrl)) {
                continue;
            }
            /*
             * Mark before fetching so duplicate queue
             * entries cannot cause duplicate requests.
             */
            crawledUrls.add(nextUrl);
            /*
             * Validate again before fetching.
             *
             * This is intentional security defense.
             */
            try {
                await (0, url_validator_1.validateTargetUrl)(nextUrl);
            }
            catch (error) {
                failedUrls.push({
                    url: nextUrl,
                    error: error instanceof Error ? error.message : "URL validation failed",
                });
                continue;
            }
            try {
                console.log(`Crawling: ${nextUrl}`);
                const response = await (0, http_fetcher_1.fetchPage)(nextUrl);
                const finalUrl = response.url;
                if (finalUrls.has(finalUrl)) {
                    continue;
                }
                finalUrls.add(finalUrl);
                const pageData = (0, page_extractor_1.extractPageData)(response.body, response.url);
                pages.push(pageData);
                /*
                 * Find new internal links.
                 */
                for (const link of pageData.links) {
                    /*
                     * Stop discovering new pages once
                     * we've reached our maximum.
                     */
                    if (queuedUrls.size >= MAX_PAGES) {
                        break;
                    }
                    const normalized = (0, url_normalizer_1.normalizeUrl)(link.url, response.url);
                    if (!normalized) {
                        continue;
                    }
                    /*
                     * Only crawl the same website.
                     */
                    if (!(0, url_normalizer_1.isSameOrigin)(normalized, rootUrl)) {
                        continue;
                    }
                    const normalizedUrl = normalized.href;
                    /*
                     * Don't queue duplicates.
                     */
                    if (queuedUrls.has(normalizedUrl)) {
                        continue;
                    }
                    queuedUrls.add(normalizedUrl);
                    queue.push(normalizedUrl);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown crawling error";
                console.error(`Failed: ${nextUrl} → ${message}`);
                failedUrls.push({
                    url: nextUrl,
                    error: message,
                });
            }
        }
    }
    /*
     * Start a limited number of workers.
     */
    const workers = Array.from({
        length: MAX_CONCURRENT_REQUESTS,
    }, () => worker());
    await Promise.all(workers);
    const websiteData = {
        website: {
            url: rootUrl.href,
            domain: rootUrl.hostname,
            crawledAt: new Date().toISOString(),
        },
        pages,
        summary: {
            pagesDiscovered: queuedUrls.size,
            pagesCrawled: pages.length,
            pagesFailed: failedUrls.length,
            totalLinks: pages.reduce((total, page) => total + page.links.length, 0),
            totalImages: pages.reduce((total, page) => total + page.images.length, 0),
        },
    };
    return {
        website: websiteData,
        failedUrls,
    };
}
