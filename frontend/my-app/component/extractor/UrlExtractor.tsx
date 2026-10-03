import { Globe, Loader2 } from "lucide-react";

interface UrlExtractorProps {
  url: string;
  onUrlChange: (url: string) => void;
  onExtract: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function UrlExtractor({
  url,
  onUrlChange,
  onExtract,
  isLoading,
  disabled = false,
}: UrlExtractorProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExtract();
  };

  const isDisabled = disabled || isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="url-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Website URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Enter website URL"
            required
            disabled={isDisabled}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The URL will be crawled and converted into structured JSON.
        </p>
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Extracting..." : "Extract Website Data"}
      </button>
    </form>
  );
}