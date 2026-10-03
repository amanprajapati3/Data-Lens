"use client";

import type {
  ExtractionResult,
  ImageExtractionData,
  ImageExtractionResult,
  UrlExtractionResult,
  CrawlData,
  WebsiteData,
} from "@/types/extractor";
import DownloadActions from "./DownloadActions";
import JsonViewer from "./JsonViewer";
import ResultHeader from "./ResultHeader";
import ResultSection from "./ResultSection";

interface ResultsProps {
  result: ExtractionResult;
}

function isUrlResult(result: ExtractionResult): result is UrlExtractionResult {
  return result.mode === "url";
}

function isImageResult(result: ExtractionResult): result is ImageExtractionResult {
  return result.mode === "image";
}

function getWebsiteDataFromCrawl(data: CrawlData): WebsiteData | null {
  const candidate = data as Partial<WebsiteData>;
  if (
    candidate &&
    candidate.website &&
    Array.isArray(candidate.pages) &&
    candidate.summary
  ) {
    return candidate as WebsiteData;
  }
  return null;
}

export default function Results({ result }: ResultsProps) {
  if (isUrlResult(result)) {
    const websiteData = getWebsiteDataFromCrawl(result.data);
    const sourceUrl = result.data.website?.url;

    return (
      <div className="flex flex-col gap-6">
        <ResultHeader mode="url" source={sourceUrl} />
        <DownloadActions jobId={result.jobId} />
        {websiteData && websiteData.pages && (
          <ResultSection
            title="Pages"
            description={`${websiteData.pages.length} page${websiteData.pages.length === 1 ? "" : "s"} extracted`}
          >
            <JsonViewer data={websiteData.pages} />
          </ResultSection>
        )}
        <ResultSection title="Full Data" description="Complete extraction result">
          <JsonViewer data={result} />
        </ResultSection>
      </div>
    );
  }

  if (isImageResult(result)) {
    const imageData = result.data as ImageExtractionData;
    const source = imageData.source?.type || "image";

    return (
      <div className="flex flex-col gap-6">
        <ResultHeader mode="image" source={source} />
        <ResultSection
          title="Extracted Data"
          description="Structured data from the screenshot"
        >
          <JsonViewer data={imageData} />
        </ResultSection>
        <ResultSection title="Full Result" description="Complete extraction result">
          <JsonViewer data={result} />
        </ResultSection>
      </div>
    );
  }

  return null;
}