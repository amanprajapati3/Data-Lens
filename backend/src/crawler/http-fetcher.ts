import { validateTargetUrl } from "./url-validator";

const REQUEST_TIMEOUT = 10_000;

// Maximum response body we'll accept: 5 MB
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;

const MAX_REDIRECTS = 5;

const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
];

export interface FetchResult {
  url: string;
  status: number;
  contentType: string;
  body: string;
}

function getContentType(
  contentType: string | null
): string {
  if (!contentType) {
    return "";
  }

  return contentType
    .split(";")[0]
    .trim()
    .toLowerCase();
}

async function fetchWithTimeout(
  url: URL,
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, {
    method: "GET",

    headers: {
      Accept:
        "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",

      "User-Agent":
        "WebsiteDataExtractor/1.0 (+public website crawler)",
    },

    redirect: "manual",

    signal,
  });
}
export async function fetchPage(
  inputUrl: string
): Promise<FetchResult> {
  let currentUrl =
    await validateTargetUrl(inputUrl);

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount++
  ) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    let response: Response;

    try {
      response = await fetchWithTimeout(
        currentUrl,
        controller.signal
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "Request timed out after 10 seconds"
        );
      }

      throw new Error(
        "Unable to fetch the target website"
      );
    } finally {
      clearTimeout(timeout);
    }

    /*
     * Handle redirects manually.
     *
     * This is important because a safe URL could redirect
     * to a private/internal URL.
     */
    if (
      response.status >= 300 &&
      response.status < 400
    ) {
      const location =
        response.headers.get("location");

      if (!location) {
        throw new Error(
          "Redirect response did not contain a location"
        );
      }

      if (redirectCount === MAX_REDIRECTS) {
        throw new Error(
          "Too many redirects"
        );
      }

      let redirectUrl: URL;

      try {
        redirectUrl = new URL(
          location,
          currentUrl
        );
      } catch {
        throw new Error(
          "Invalid redirect URL"
        );
      }

      /*
       * Validate every redirect destination.
       */
      currentUrl =
        await validateTargetUrl(
          redirectUrl.href
        );

      continue;
    }

    /*
     * Only accept successful responses.
     */
    if (!response.ok) {
      throw new Error(
        `Website returned HTTP ${response.status}`
      );
    }

    const contentType =
      getContentType(
        response.headers.get("content-type")
      );

    /*
     * We only want HTML pages at this stage.
     */
    if (
      !ALLOWED_CONTENT_TYPES.includes(
        contentType
      )
    ) {
      throw new Error(
        `Unsupported content type: ${contentType || "unknown"}`
      );
    }

    /*
     * Check Content-Length when the server provides it.
     */
    const contentLength =
      response.headers.get(
        "content-length"
      );

    if (contentLength) {
      const size =
        Number(contentLength);

      if (
        Number.isFinite(size) &&
        size > MAX_RESPONSE_SIZE
      ) {
        throw new Error(
          "Response is larger than the 5 MB limit"
        );
      }
    }

    if (!response.body) {
      throw new Error(
        "Response body is empty"
      );
    }

    /*
     * Read the response in chunks so we can enforce
     * the 5 MB limit even when Content-Length is missing.
     */
    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    const chunks: string[] = [];

    let totalBytes = 0;

    while (true) {
      const { done, value } =
        await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (
        totalBytes > MAX_RESPONSE_SIZE
      ) {
        await reader.cancel();

        throw new Error(
          "Response exceeded the 5 MB limit"
        );
      }

      chunks.push(
        decoder.decode(value, {
          stream: true,
        })
      );
    }

    chunks.push(
      decoder.decode()
    );

    return {
      url: currentUrl.href,
      status: response.status,
      contentType,
      body: chunks.join(""),
    };
  }

  throw new Error(
    "Unable to fetch website"
  );
}