import type { ApiResponse } from "@/types/api";
import { isApiError } from "@/types/api";
import type {
  CrawlResponse,
  ImageExtractionData,
  ImageExtractionResponse,
} from "@/types/extractor";

/*
 * Resolved at call time rather than at module load so that
 * importing this file never throws, for example during SSR or
 * a static build on a machine without the env var set.
 */
function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (typeof configured !== "string" || configured.trim().length === 0) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local, for example NEXT_PUBLIC_API_URL=http://localhost:5000",
    );
  }

  return configured.trim().replace(/\/+$/, "");
}

/*
 * Every backend error uses the same envelope, so the message can
 * be surfaced directly. Some failures (rate limiting, proxies,
 * restarts) answer with HTML or nothing at all, hence the fallback.
 */
async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as ApiResponse<unknown>;

    if (isApiError(body) && body.message) {
      return body.message;
    }
  } catch {
    // Body was not JSON.
  }

  return fallback;
}

async function request<T>(path: string, init: RequestInit, fallback: string): Promise<T> {
  const baseUrl = getBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, init);
  } catch {
    throw new Error(`${fallback}. The backend at ${baseUrl} could not be reached.`);
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `${fallback} (status ${response.status})`));
  }

  return (await response.json()) as T;
}

/*
 * POST /api/crawl
 *
 * Returns the response as the backend sends it: the job ID plus the
 * website metadata and crawl summary. The crawled pages stay on the
 * backend and are only reachable through the export endpoints.
 */
export async function crawlWebsite(url: string): Promise<CrawlResponse> {
  return request<CrawlResponse>(
    "/api/crawl",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    },
    "Unable to crawl website",
  );
}

/*
 * POST /api/image-extract
 *
 * The file is sent as multipart/form-data in the "image" field.
 * Content-Type is deliberately left unset so the browser can add
 * the multipart boundary itself.
 */
export async function extractImage(file: File): Promise<ImageExtractionData> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await request<ImageExtractionResponse>(
    "/api/image-extract",
    {
      method: "POST",
      body: formData,
    },
    "Unable to extract data from the image",
  );

  return response.data;
}

/*
 * Export downloads.
 *
 * These build a URL only. The browser follows it directly so the
 * file arrives as a download instead of being buffered by fetch.
 */

export function getJsonExportUrl(jobId: string): string {
  return `${getBaseUrl()}/api/export/${encodeURIComponent(jobId)}/json`;
}

export function getZipExportUrl(jobId: string): string {
  return `${getBaseUrl()}/api/export/${encodeURIComponent(jobId)}/zip`;
}
