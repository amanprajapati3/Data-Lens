"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlConcurrency = crawlConcurrency;
const MAX_CONCURRENT_CRAWLS = 2;
let activeCrawls = 0;
function crawlConcurrency(req, res, next) {
    if (activeCrawls >=
        MAX_CONCURRENT_CRAWLS) {
        return res.status(503).json({
            success: false,
            message: "The crawler is currently busy. Please try again shortly.",
        });
    }
    activeCrawls++;
    let released = false;
    const release = () => {
        if (released) {
            return;
        }
        released = true;
        activeCrawls--;
    };
    /*
     * Release the crawl slot when the
     * response finishes or the connection
     * closes.
     */
    res.once("finish", release);
    res.once("close", release);
    next();
}
