import { fetchPage } from "./http-fetcher";

async function test() {
  try {
    console.log(
      "Testing request timeout..."
    );

    await fetchPage(
      "https://httpstat.us/200?sleep=15000"
    );

    console.log(
      "ERROR: Request did not timeout"
    );
  } catch (error) {
    console.log(
      "\nResult:"
    );

    console.log(
      error instanceof Error
        ? error.message
        : error
    );
  }
}

test();