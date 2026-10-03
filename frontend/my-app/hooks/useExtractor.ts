import { useCallback, useState } from "react";

import { crawlWebsite, extractImage } from "@/lib/api";
import type { ExtractionMode, ExtractionResult } from "@/types/extractor";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE_LABEL = "5 MB";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase().trim())) {
    return "Unsupported image type. Choose a JPEG, PNG or WEBP file.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image is too large. Maximum size is ${MAX_IMAGE_SIZE_LABEL}.`;
  }

  return null;
}

function toMessage(caught: unknown, fallback: string): string {
  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return fallback;
}

export function useExtractor() {
  const [mode, setMode] = useState<ExtractionMode>("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const extractFromUrl = useCallback(async () => {
    if (isLoading) {
      return;
    }

    const target = url.trim();

    if (target.length === 0) {
      setError("Enter a website URL to extract.");

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await crawlWebsite(target);

      setResult({
        mode: "url",
        jobId: response.jobId,
        data: response.data,
      });
      setJobId(response.jobId);
    } catch (caught) {
      setError(toMessage(caught, "Unable to crawl that website."));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, url]);

  const extractFromImage = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (!selectedFile) {
      setError("Choose an image to extract.");

      return;
    }

    const invalid = validateImage(selectedFile);

    if (invalid) {
      setError(invalid);

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await extractImage(selectedFile);

      setResult({ mode: "image", data });
      setJobId(null);
    } catch (caught) {
      setError(toMessage(caught, "Unable to extract data from that image."));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedFile]);

  const clearResult = useCallback(() => {
    setResult(null);
    setJobId(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMode("url");
    setUrl("");
    setSelectedFile(null);
    setResult(null);
    setJobId(null);
    setError(null);
  }, []);

  return {
    mode,
    setMode,
    url,
    setUrl,
    selectedFile,
    setSelectedFile,
    isLoading,
    error,
    result,
    jobId,
    extractFromUrl,
    extractFromImage,
    clearResult,
    clearError,
    reset,
  };
}
