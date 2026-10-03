"use client";

import { Loader2 } from "lucide-react";

interface ExtractionProgressProps {
  mode: "url" | "image";
}

export default function ExtractionProgress({
  mode,
}: ExtractionProgressProps) {
  const isUrlMode = mode === "url";

  const heading = isUrlMode
    ? "Extracting Website Data..."
    : "Analyzing Screenshot...";

  const description = isUrlMode
    ? "Crawling the website and collecting structured content. This may take a moment."
    : "Analyzing the screenshot and identifying sections, content, images, and UI elements.";

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-gray-200 bg-white px-6 py-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:py-10">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
            {heading}
          </h3>
          <p className="max-w-md text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}