"use client";

import ExtractionError from "./ExtractionError";
import ExtractionProgress from "./ExtractionProgress";
import ImageExtractor from "./ImageExtractor";
import ModeSelector from "./ModeSelector";
import UrlExtractor from "./UrlExtractor";
import type { ExtractionMode } from "@/types/extractor";

interface ExtractorProps {
  mode: ExtractionMode;
  setMode: (mode: ExtractionMode) => void;
  url: string;
  setUrl: (url: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isLoading: boolean;
  error: string | null;
  extractFromUrl: () => Promise<void>;
  extractFromImage: () => Promise<void>;
  clearError: () => void;
}

export default function Extractor({
  mode,
  setMode,
  url,
  setUrl,
  selectedFile,
  setSelectedFile,
  isLoading,
  error,
  extractFromUrl,
  extractFromImage,
  clearError,
}: ExtractorProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Extract Website Data
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            Extract structured website data either from a website URL or from a
            screenshot.
          </p>
        </div>

        <ModeSelector mode={mode} onModeChange={setMode} disabled={isLoading} />

        {isLoading && <ExtractionProgress mode={mode} />}

        {error && !isLoading && (
          <ExtractionError message={error} onDismiss={clearError} />
        )}

        {!isLoading && !error && mode === "url" && (
          <UrlExtractor
            url={url}
            onUrlChange={setUrl}
            onExtract={extractFromUrl}
            isLoading={isLoading}
          />
        )}

        {!isLoading && !error && mode === "image" && (
          <ImageExtractor
            selectedFile={selectedFile}
            onFileChange={setSelectedFile}
            onExtract={extractFromImage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}