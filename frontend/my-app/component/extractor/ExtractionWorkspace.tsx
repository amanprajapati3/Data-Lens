"use client";

import { useEffect } from "react";

import { useExtractor } from "@/hooks/useExtractor";
import Extractor from "@/component/extractor/Extractor";
import Results from "@/component/results/Results";
import type { ExtractionMode } from "@/types/extractor";
import ScrollReveal from "@/component/shared/ScrollReveal";

interface ExtractionWorkspaceProps {
  modeParam?: string | null;
  embedded?: boolean;
}

export default function ExtractionWorkspace({
  modeParam,
  embedded = false,
}: ExtractionWorkspaceProps) {
  const {
    result,
    reset,
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
  } = useExtractor();
  const resetButton = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
      >
        Start Another Extraction
      </button>
    </div>
  );

  useEffect(() => {
    if (modeParam === "image" || modeParam === "url") {
      setMode(modeParam as ExtractionMode);
    }
  }, [modeParam, setMode]);

  const content = result ? (
    <div className="flex flex-col gap-6">
      {resetButton}
      <Results result={result} compact={embedded} />
    </div>
  ) : (
    <Extractor
      mode={mode}
      setMode={setMode}
      url={url}
      setUrl={setUrl}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      isLoading={isLoading}
      error={error}
      extractFromUrl={extractFromUrl}
      extractFromImage={extractFromImage}
      clearError={clearError}
      compact={embedded}
    />
  );

  if (embedded) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal as="div" className="w-full" distance={18}>
          {content}
        </ScrollReveal>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <ScrollReveal as="div" className="w-full" distance={18}>
        {content}
      </ScrollReveal>
    </main>
  );
}
