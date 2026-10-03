import { Request, Response, NextFunction } from "express";

const MAX_CONCURRENT_CRAWLS = 2;

let activeCrawls = 0;

export function crawlConcurrency(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    activeCrawls >=
    MAX_CONCURRENT_CRAWLS
  ) {
    return res.status(503).json({
      success: false,
      message:
        "The crawler is currently busy. Please try again shortly.",
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
  res.once(
    "finish",
    release
  );

  res.once(
    "close",
    release
  );

  next();
}