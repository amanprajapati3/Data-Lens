"use client";

import { Globe, Image as ImageIcon } from "lucide-react";

interface ResultHeaderProps {
  mode: "url" | "image";
  title?: string;
  source?: string;
}

export default function ResultHeader({
  mode,
  title,
  source,
}: ResultHeaderProps) {
  const isUrlMode = mode === "url";

  const heading = title
    ? title
    : isUrlMode
      ? "Website Data Extracted"
      : "Screenshot Data Extracted";

  const description = isUrlMode
    ? "Structured data extracted from the crawled website."
    : "Structured data extracted from the uploaded screenshot.";

  const Icon = isUrlMode ? Globe : ImageIcon;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {heading}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              {description}
            </p>
          </div>
          {source && (
            <div className="flex flex-col gap-1 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {isUrlMode ? "Source URL" : "Source"}
              </span>
              <span className="break-all text-sm text-gray-900 dark:text-gray-100">
                {source}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}