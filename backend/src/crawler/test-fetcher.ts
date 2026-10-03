import { fetchPage } from "./http-fetcher";

async function test() {
  try {
    const result = await fetchPage(
      "https://example.com"
    );

    console.log("URL:", result.url);
    console.log("Status:", result.status);
    console.log(
      "Content-Type:",
      result.contentType
    );

    console.log(
      "HTML length:",
      result.body.length
    );

    console.log(
      "\nFirst 300 characters:\n"
    );

    console.log(
      result.body.slice(0, 300)
    );
  } catch (error) {
    console.error(
      "FETCH ERROR:",
      error instanceof Error
        ? error.message
        : error
    );
  }
}

test();