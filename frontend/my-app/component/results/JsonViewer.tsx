"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface JsonViewerProps {
  data: unknown;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const formattedJson = (() => {
    try {
      if (data === undefined) {
        return "null";
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return "null";
    }
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/60 sm:px-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          JSON
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="max-h-96 overflow-auto p-4 sm:max-h-[600px] sm:p-6">
        <pre className="overflow-x-auto whitespace-pre text-xs font-mono leading-relaxed text-gray-100 sm:text-sm">
          <code className="block">{formattedJson}</code>
        </pre>
      </div>
    </div>
  );
}