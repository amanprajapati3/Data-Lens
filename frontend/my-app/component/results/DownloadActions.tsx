"use client";

import { Download } from "lucide-react";
import { getJsonExportUrl, getZipExportUrl } from "@/lib/api";

interface DownloadActionsProps {
  jobId?: string;
  data?: unknown;
  filename?: string;
}

export default function DownloadActions({ jobId, data, filename }: DownloadActionsProps) {
  const hasJobId = Boolean(jobId && jobId.trim().length > 0);
  const canDownloadJson = hasJobId || data !== undefined;
  const canDownloadZip = hasJobId;

  const handleJsonDownload = () => {
    if (hasJobId) {
      const a = document.createElement("a");
      a.href = getJsonExportUrl(jobId as string);
      a.download = "";
      a.click();
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename ?? "extraction"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      {canDownloadJson && (
        <button
          type="button"
          onClick={handleJsonDownload}
          className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Download className="h-4 w-4" />
          Download JSON
        </button>
      )}
      {canDownloadZip && (
        <a
          href={getZipExportUrl(jobId as string)}
          download
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          <Download className="h-4 w-4" />
          Download ZIP
        </a>
      )}
    </div>
  );
}
