"use client";

import { useSyncExternalStore, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Braces,
  Check,
  Copy,
  FileDown,
  FileUp,
  Table2,
  X,
} from "lucide-react";
import { csvToJson, jsonToCsv, type CsvDirection } from "@/lib/csv";
import {
  clearLastExtraction,
  getLastExtractionClientSnapshot,
  getLastExtractionServerSnapshot,
  subscribeLastExtraction,
} from "@/lib/last-extraction";

const SAMPLES: Record<CsvDirection, string> = {
  json2csv: `[
  {
    "name": "Alice",
    "age": 30,
    "city": "Paris",
    "tags": ["admin", "beta"]
  },
  {
    "name": "Bob",
    "age": 25,
    "city": "London",
    "tags": []
  }
]`,
  csv2json: `name,age,city
Alice,30,Paris
Bob,25,London`,
};

const DIRECTIONS: {
  value: CsvDirection;
  label: string;
  icon: typeof Braces;
}[] = [
  { value: "json2csv", label: "JSON to CSV", icon: Braces },
  { value: "csv2json", label: "CSV to JSON", icon: Table2 },
];

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const MAX_UPLOAD_SIZE_LABEL = "10 MB";

const ACCEPTED_UPLOAD_TYPES =
  ".json,.csv,.tsv,.txt,application/json,text/csv,text/plain";

const paneClass =
  "flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

const paneHeaderClass =
  "flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60";

const textareaClass =
  "min-h-[16rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-600";

const primaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-950";

function toJsonText(value: unknown): string | null {
  try {
    return JSON.stringify(value, null, 2) ?? null;
  } catch {
    return null;
  }
}

export default function JsonCsvConverter() {
  const lastExtraction = useSyncExternalStore(
    subscribeLastExtraction,
    getLastExtractionClientSnapshot,
    getLastExtractionServerSnapshot,
  );

  const [direction, setDirection] = useState<CsvDirection>("json2csv");
  /*
   * null means the user has not typed yet, so
   * the input follows the latest extraction.
   * Any typing, clearing or sample load takes
   * over the field until it is dismissed.
   */
  const [typedInput, setTypedInput] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractedText = lastExtraction
    ? toJsonText(lastExtraction.data)
    : null;
  const input = typedInput ?? extractedText ?? "";

  const isJsonToCsv = direction === "json2csv";

  const inputLabel = isJsonToCsv ? "JSON input" : "CSV input";
  const outputLabel = isJsonToCsv ? "CSV output" : "JSON output";
  const inputPlaceholder = isJsonToCsv
    ? 'Paste or upload JSON here, for example [{ "name": "Alice" }]'
    : "Paste or upload CSV here, for example name,age";
  const outputExtension = isJsonToCsv ? "csv" : "json";

  const handleSwitch = (next: CsvDirection) => {
    if (next === direction) {
      return;
    }

    setDirection(next);
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const handleConvert = () => {
    const source = input.trim();

    if (!source) {
      setOutput("");
      setError(`Paste or upload ${inputLabel.replace(" input", "")} first.`);
      return;
    }

    try {
      if (isJsonToCsv) {
        let parsed: unknown;

        try {
          parsed = JSON.parse(source);
        } catch (caught) {
          throw new Error(
            `Invalid JSON: ${caught instanceof Error ? caught.message : "unable to parse"}`,
          );
        }

        setOutput(jsonToCsv(parsed));
      } else {
        setOutput(JSON.stringify(csvToJson(source), null, 2));
      }

      setError(null);
      setCopied(false);
    } catch (caught) {
      setOutput("");
      setError(
        caught instanceof Error
          ? caught.message
          : "The conversion failed",
      );
    }
  };

  const handleClear = () => {
    setTypedInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const loadSample = (next: CsvDirection) => {
    setDirection(next);
    setTypedInput(SAMPLES[next]);
    setOutput("");
    setError(null);
    setCopied(false);
  };

  /*
   * Cross button: drop the stored extraction
   * and fall back to the default empty state.
   */
  const handleDismissExtraction = () => {
    clearLastExtraction();
    setTypedInput(null);
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const handleInputChange = (value: string) => {
    setTypedInput(value);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /*
   * The file lands in the input exactly like a
   * paste would. A clear extension picks the
   * matching direction, anything else keeps
   * the one that is already selected.
   */
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setOutput("");
      setError(`File is too large. Maximum file size is ${MAX_UPLOAD_SIZE_LABEL}.`);
      setCopied(false);
      return;
    }

    let text: string;

    try {
      text = await file.text();
    } catch {
      setOutput("");
      setError("The file could not be read. Try pasting its content instead.");
      setCopied(false);
      return;
    }

    if (!text.trim()) {
      setOutput("");
      setError("The uploaded file is empty.");
      setCopied(false);
      return;
    }

    const extension = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : "";

    if (extension === ".json") {
      setDirection("json2csv");
    } else if (extension === ".csv" || extension === ".tsv") {
      setDirection("csv2json");
    }

    setTypedInput(text);
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!output) {
      return;
    }

    const blob = new Blob([output], {
      type: isJsonToCsv ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `converted.${outputExtension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {lastExtraction && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm sm:px-5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Braces className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Showing your latest extraction (
                {lastExtraction.mode === "image" ? "image" : "url"})
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                It is ready to convert below. Press the cross to start with
                the default instead.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissExtraction}
            aria-label="Dismiss extracted data"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300">
            Free Tool
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Choose a direction
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Everything runs in your browser. Nothing is uploaded.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Conversion direction"
          className="inline-flex w-fit rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {DIRECTIONS.map(({ value, label, icon: Icon }) => {
            const active = value === direction;

            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSwitch(value)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={paneClass}>
          <div className={paneHeaderClass}>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {inputLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-emerald-700 underline-offset-2 transition hover:underline dark:text-emerald-400"
              >
                <FileUp className="h-3.5 w-3.5" />
                Upload file
              </button>
              <button
                type="button"
                onClick={() => loadSample(direction)}
                className="cursor-pointer text-xs font-medium text-emerald-700 underline-offset-2 transition hover:underline dark:text-emerald-400"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer text-xs font-medium text-zinc-500 underline-offset-2 transition hover:underline dark:text-zinc-400"
              >
                Clear
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_UPLOAD_TYPES}
            onChange={handleFileInputChange}
            className="sr-only"
            aria-label="Upload a JSON or CSV file"
          />
          <textarea
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            spellCheck={false}
            aria-label={inputLabel}
            placeholder={inputPlaceholder}
            className={`${textareaClass} resize-y`}
          />
        </section>

        <section className={paneClass}>
          <div className={paneHeaderClass}>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {outputLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-600 underline-offset-2 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-600 underline-offset-2 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            aria-label={outputLabel}
            placeholder="The converted result appears here"
            className={`${textareaClass} cursor-default bg-zinc-50/60 dark:bg-zinc-950/50`}
          />
        </section>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          className={primaryButton}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {isJsonToCsv ? "Convert to CSV" : "Convert to JSON"}
        </button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {isJsonToCsv
            ? "Nested objects become dot separated columns, arrays become JSON strings."
            : "The first row becomes the header. Comma, tab and semicolon files are detected automatically; quoted values, line breaks and numbers are supported."}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Try a sample:
        </span>
        <button
          type="button"
          onClick={() => loadSample("json2csv")}
          className="cursor-pointer text-xs font-medium text-zinc-700 underline-offset-2 transition hover:underline dark:text-zinc-300"
        >
          JSON to CSV
        </button>
        <span aria-hidden className="text-xs text-zinc-400">
          ·
        </span>
        <button
          type="button"
          onClick={() => loadSample("csv2json")}
          className="cursor-pointer text-xs font-medium text-zinc-700 underline-offset-2 transition hover:underline dark:text-zinc-300"
        >
          CSV to JSON
        </button>
      </div>
    </div>
  );
}
