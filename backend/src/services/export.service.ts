import { Response } from "express";

import { WebsiteData, PageData } from "../types/crawler.types";

function safeFileName(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getPageFileName(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);

    let pathname = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "");

    if (!pathname) {
      pathname = "home";
    }

    /*
     * Include query parameters if they exist.
     */
    if (url.search) {
      pathname +=
        "-" + url.search.replace("?", "").replace(/[^a-zA-Z0-9-_]/g, "-");
    }

    return (safeFileName(pathname) || "page") + ".json";
  } catch {
    return "page.json";
  }
}

/**
 * Create JSON string for the
 * complete website.
 */
export function createFullJson(websiteData: WebsiteData): string {
  return JSON.stringify(websiteData, null, 2);
}

/**
 * Create JSON string for
 * one individual page.
 */
export function createPageJson(page: PageData): string {
  return JSON.stringify(page, null, 2);
}

/**
 * Create one JSON file in
 * the HTTP response.
 */
export function sendSingleJson(websiteData: WebsiteData, res: Response): void {
  const domain = safeFileName(websiteData.website.domain) || "website";

  const fileName = `${domain}-data.json`;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  res.send(createFullJson(websiteData));
}

/**
 * Create a ZIP containing:
 *
 * website.json
 * pages/*.json
 * summary.json
 */
export async function sendZip(
  websiteData: WebsiteData,
  res: Response
): Promise<void> {
  const domain = safeFileName(websiteData.website.domain) || "website";
  const fileName = `${domain}-data.zip`;

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  /*
   * archiver v8 is ESM-only. This project compiles to CommonJS, so a static
   * "import { ZipArchive }" resolves to undefined at runtime. A dynamic import
   * is the only form that yields the real ZipArchive class here.
   */
  const { ZipArchive } = await import("archiver");

  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  const fail = (error: Error): void => {
    console.error("ZIP archive error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to create ZIP export",
      });
    } else {
      res.destroy(error);
    }
  };

  archive.on("error", fail);

  archive.on("warning", (warning) => {
    console.warn("ZIP archive warning:", warning);
  });

  archive.pipe(res);

  archive.append(JSON.stringify(websiteData, null, 2), {
    name: "website.json",
  });

  const usedNames = new Map<string, number>();

  for (const page of websiteData.pages) {
    const baseName = getPageFileName(page.url);

    const count = usedNames.get(baseName) ?? 0;
    usedNames.set(baseName, count + 1);

    const pageFileName =
      count === 0 ? baseName : baseName.replace(/\.json$/, `-${count}.json`);

    archive.append(createPageJson(page), {
      name: `pages/${pageFileName}`,
    });
  }

  archive.append(JSON.stringify(websiteData.summary, null, 2), {
    name: "summary.json",
  });

  archive.finalize().catch(fail);
}

/**
 * Find one page by URL.
 */
export function findPage(
  websiteData: WebsiteData,
  pageUrl: string,
): PageData | null {
  return websiteData.pages.find((page) => page.url === pageUrl) || null;
}

/**
 * Send one selected page
 * as a downloadable JSON file.
 */
export function sendPageJson(
  websiteData: WebsiteData,
  pageUrl: string,
  res: Response,
): void {
  const page = findPage(websiteData, pageUrl);

  if (!page) {
    res.status(404).json({
      success: false,
      message: "Requested page was not found.",
    });

    return;
  }

  const fileName = getPageFileName(page.url);

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  res.send(createPageJson(page));
}
