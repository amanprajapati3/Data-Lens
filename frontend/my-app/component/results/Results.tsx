"use client";

import { useState } from "react";
import type {
  ExtractionResult,
  ImageExtractionData,
  ImageExtractionResult,
  UrlExtractionResult,
  CrawlData,
  PageData,
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
  /*
   * Local copy so edits from the JSON viewers
   * (manual or with AI) can be saved and flow
   * into both sections and the download.
   */
  const [localResult, setLocalResult] = useState<ExtractionResult>(result);
  const [prevResult, setPrevResult] = useState<ExtractionResult>(result);

  /*
   * Follow a new prop during render instead of
   * in an effect, so a fresh extraction replaces
   * any unsaved edits.
   */
  if (result !== prevResult) {
    setPrevResult(result);
    setLocalResult(result);
  }

  const handleFullSave = (value: unknown) => {
    setLocalResult(value as ExtractionResult);
  };

  const handleImageSave = (value: unknown) => {
    setLocalResult((prev) => {
      if (prev.mode !== "image") {
        return prev;
      }

      return {
        ...prev,
        data: value as ImageExtractionData,
      };
    });
  };

  const handlePagesSave = (value: unknown) => {
    setLocalResult((prev) => {
      if (prev.mode !== "url") {
        return prev;
      }

      const data = { ...prev.data } as CrawlData & {
        pages?: PageData[];
      };

      data.pages = value as PageData[];

      return {
        ...prev,
        data,
      };
    });
  };

  if (isUrlResult(localResult)) {
    const websiteData = getWebsiteDataFromCrawl(localResult.data);
    const sourceUrl = localResult.data.website?.url;

    return (
      <div className="flex flex-col gap-6">
        <ResultHeader mode="url" source={sourceUrl} />
        <DownloadActions jobId={localResult.jobId} />
        {websiteData && websiteData.pages && (
          <ResultSection
            title="Pages"
            description={`${websiteData.pages.length} page${websiteData.pages.length === 1 ? "" : "s"} extracted`}
          >
            <JsonViewer data={websiteData.pages} onSave={handlePagesSave} />
          </ResultSection>
        )}
        <ResultSection title="Full Data" description="Complete extraction result">
          <JsonViewer data={localResult} onSave={handleFullSave} />
        </ResultSection>
      </div>
    );
  }

  if (isImageResult(localResult)) {
    const imageData = localResult.data as ImageExtractionData;
    const source = imageData.source?.type || "image";

    return (
      <div className="flex flex-col gap-6">
        <ResultHeader mode="image" source={source} />
        <DownloadActions data={localResult} filename="image-extraction" />
        <ResultSection
          title="Extracted Data"
          description="Structured data from the screenshot"
        >
          <JsonViewer data={imageData} onSave={handleImageSave} />
        </ResultSection>
      </div>
    );
  }

  return null;
}
