
"use client";

import { useExtractor } from "@/hooks/useExtractor";
import Extractor from "@/component/extractor/Extractor";
import Results from "@/component/results/Results";

export default function Home() {
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {result ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
              >
                Start Another Extraction
              </button>
            </div>
            <Results result={result} />
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
          />
        )}
      </main>
    </div>
  );
}
