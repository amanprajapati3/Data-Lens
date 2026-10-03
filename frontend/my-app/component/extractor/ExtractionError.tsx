"use client";

import { AlertCircle, X } from "lucide-react";

interface ExtractionErrorProps {
  message: string;
  onDismiss?: () => void;
}

export default function ExtractionError({
  message,
  onDismiss,
}: ExtractionErrorProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200 sm:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-base font-semibold text-red-800 dark:text-red-100 sm:text-lg">
            Extraction Failed
          </h3>
          <p className="text-sm text-red-700 dark:text-red-200 sm:text-base">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-600 transition hover:bg-red-100/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:text-red-300 dark:hover:bg-red-900/40 dark:focus:ring-offset-gray-900"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    </div>
  );
}