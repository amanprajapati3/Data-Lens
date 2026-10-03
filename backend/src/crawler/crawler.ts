import { fetchPage } from "./http-fetcher";
import { normalizeUrl, isSameOrigin } from "./url-normalizer";
import { validateTargetUrl } from "./url-validator";
import { extractPageData, PageData } from "../extractor/page.extractor";
import { WebsiteData } from "../types/crawler.types";

const MAX_PAGES = 20;
const MAX_CONCURRENT_REQUESTS = 2;

export interface CrawlResult {
  website: WebsiteData;
  failedUrls: {
    url: string;
    error: string;
  }[];
}

export async function crawlWebsite(startUrl: string): Promise<CrawlResult> {
  /*
   * Validate the starting URL first.
   */
  const rootUrl = await validateTargetUrl(startUrl);

  /*
   * Queue containing URLs waiting to be crawled.
   */
  const queue: string[] = [rootUrl.href];

  /*
   * Prevent duplicate crawling.
   */
  const queuedUrls = new Set<string>([rootUrl.href]);

  const crawledUrls = new Set<string>();

  const finalUrls = new Set<string>();

  const pages: PageData[] = [];
  const failedUrls: {
    url: string;
    error: string;
  }[] = [];

  /*
   * Process the queue with limited concurrency.
   */
  async function worker(): Promise<void> {
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
        await validateTargetUrl(nextUrl);
      } catch (error) {
        failedUrls.push({
          url: nextUrl,
          error:
            error instanceof Error ? error.message : "URL validation failed",
        });

        continue;
      }

      try {
        console.log(`Crawling: ${nextUrl}`);

        const response = await fetchPage(nextUrl);
        const finalUrl = response.url;

        if (finalUrls.has(finalUrl)) {
          continue;
        }

        finalUrls.add(finalUrl);

        const pageData = extractPageData(response.body, response.url);

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

          const normalized = normalizeUrl(link.url, response.url);

          if (!normalized) {
            continue;
          }

          /*
           * Only crawl the same website.
           */
          if (!isSameOrigin(normalized, rootUrl)) {
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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown crawling error";

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
  const workers = Array.from(
    {
      length: MAX_CONCURRENT_REQUESTS,
    },
    () => worker(),
  );

  await Promise.all(workers);

  const websiteData: WebsiteData = {
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
