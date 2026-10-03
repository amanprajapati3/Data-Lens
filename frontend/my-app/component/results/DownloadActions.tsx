"use client";

import { Download } from "lucide-react";
import { getJsonExportUrl, getZipExportUrl } from "@/lib/api";

interface DownloadActionsProps {
  jobId: string;
}

export default function DownloadActions({ jobId }: DownloadActionsProps) {
  const isDisabled = !jobId || jobId.trim().length === 0;

  const jsonUrl = isDisabled ? "#" : getJsonExportUrl(jobId);
  const zipUrl = isDisabled ? "#" : getZipExportUrl(jobId);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <a
        href={jsonUrl}
        download
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
      >
        <Download className="h-4 w-4" />
        Download JSON
      </a>
      <a
        href={zipUrl}
        download
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
      >
        <Download className="h-4 w-4" />
        Download ZIP
      </a>
    </div>
  );
}