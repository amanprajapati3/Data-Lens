import fs from "fs";
import path from "path";

import { crawlWebsite } from "../crawler/crawler";

async function test() {
  try {
    console.log(
      "Starting website crawl..."
    );

    const result =
      await crawlWebsite(
        "https://movie-book-eta.vercel.app/"
      );

    const websiteData =
      result.website;

    /*
     * Create local test directory.
     */
    const outputDir =
      path.join(
        process.cwd(),
        "test-output"
      );

    fs.mkdirSync(
      outputDir,
      {
        recursive: true,
      }
    );

    /*
     * -----------------------------
     * TEST SINGLE JSON
     * -----------------------------
     */

    const jsonPath =
      path.join(
        outputDir,
        "website-data.json"
      );

    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        websiteData,
        null,
        2
      ),
      "utf-8"
    );

    console.log(
      "\nJSON file created:"
    );

    console.log(
      jsonPath
    );

    /*
     * -----------------------------
     * TEST DATA
     * -----------------------------
     */

    console.log(
      "\nExport data:"
    );

    console.log(
      "Domain:",
      websiteData.website.domain
    );

    console.log(
      "Pages:",
      websiteData.pages.length
    );

    console.log(
      "Links:",
      websiteData.summary.totalLinks
    );

    console.log(
      "Images:",
      websiteData.summary.totalImages
    );

    console.log(
      "\nJSON export test passed."
    );
  } catch (error) {
    console.error(
      "\nEXPORT TEST FAILED:"
    );

    console.error(
      error
    );
  }
}

test();