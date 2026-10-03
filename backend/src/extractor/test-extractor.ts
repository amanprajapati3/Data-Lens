import { fetchPage } from "../crawler/http-fetcher";
import { extractPageData } from "./page.extractor";

async function test() {
  try {
    const page =
      await fetchPage(
        "https://example.com"
      );

    const data =
      extractPageData(
        page.body,
        page.url
      );

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    );
  } catch (error) {
    console.error(
      "EXTRACTION ERROR:",
      error instanceof Error
        ? error.message
        : error
    );
  }
}

test();