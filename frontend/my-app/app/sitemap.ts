import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PUBLIC_PAGES = [
  "",
  "/about",
  "/choose-us",
  "/contact",
  "/data-extract",
  "/disclaimer",
  "/image-compress",
  "/image-convert",
  "/json-csv",
  "/privacy",
  "/terms",
  "/zip-tool",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
