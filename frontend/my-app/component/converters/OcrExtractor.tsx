"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import {
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  ScanText,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { extractOcrText } from "@/lib/api";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_PDF_PAGES = 10;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const cardClass =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
const primaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-950";
const secondaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-emerald-400 dark:focus:ring-offset-zinc-950";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || /\.pdf$/i.test(file.name)
  );
}

function isSupportedImage(file: File) {
  return (
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function validateFile(file: File): string | null {
  if (isPdfFile(file)) {
    if (file.size > MAX_PDF_SIZE) {
      return "The PDF must be 50 MB or smaller.";
    }

    return null;
  }

  if (!isSupportedImage(file)) {
    return "Choose a PDF, JPEG, PNG, or WEBP file.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Images must be 5 MB or smaller.";
  }

  return null;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not prepare the PDF page for reading.")),
      "image/jpeg",
      quality,
    );
  });
}

async function renderPdfPages(file: File): Promise<File[]> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  try {
    const pdfDocument = await loadingTask.promise;

    if (pdfDocument.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `PDFs can have up to ${MAX_PDF_PAGES} pages per extraction.`,
      );
    }

    const pages: File[] = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdfDocument.numPages;
      pageNumber += 1
    ) {
      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        2,
        2400 / Math.max(baseViewport.width, baseViewport.height),
      );
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(`Could not render PDF page ${pageNumber}.`);
      }

      await page.render({ canvas, canvasContext: context, viewport }).promise;

      let blob = await canvasToBlob(canvas, 0.9);
      let quality = 0.9;

      while (blob.size > MAX_IMAGE_SIZE && quality > 0.5) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, quality);
      }

      page.cleanup();

      pages.push(
        new File([blob], `${file.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.jpg`, {
          type: "image/jpeg",
        }),
      );
    }

    return pages;
  } finally {
    await loadingTask.destroy();
  }
}

function toPlainText(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)")
    .replace(/^\s*\|.*\|\s*$/gm, (line) =>
      line.replace(/\|/g, " ").replace(/\s+/g, " ").trim(),
    )
    .replace(/^[\s:|-]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function OcrExtractor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [view, setView] = useState<"markdown" | "plain">("markdown");
  const [copied, setCopied] = useState(false);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);

    return () => window.clearTimeout(timer);
  }, [copied]);

  const updatePreview = (nextFile: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (nextFile && !isPdfFile(nextFile)) {
      const url = URL.createObjectURL(nextFile);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      return;
    }

    setPreviewUrl(null);
  };

  const plainText = useMemo(() => toPlainText(result), [result]);

  const output = view === "markdown" ? result : plainText;
  const wordCount = useMemo(
    () => output.split(/\s+/).filter(Boolean).length,
    [output],
  );

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile || isProcessing) return;

    const validationError = validateFile(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    updatePreview(nextFile);
    setFile(nextFile);
    setError(null);
    setProgress("");
    setResult("");
    setCopied(false);
    setView("markdown");
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleExtract = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProgress("");
    setResult("");
    setCopied(false);

    try {
      const pages = isPdfFile(file) ? await renderPdfPages(file) : [file];
      const sections: string[] = [];

      for (const [index, page] of pages.entries()) {
        setProgress(
          pages.length > 1
            ? `Reading page ${index + 1} of ${pages.length}...`
            : "Reading text and layout...",
        );

        const text = (await extractOcrText(page)).trim();
        const cleaned = text || "_No readable text found._";

        sections.push(
          pages.length > 1 ? `## Page ${index + 1}\n\n${cleaned}` : cleaned,
        );
      }

      setResult(sections.join("\n\n---\n\n"));
      setView("markdown");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not extract text from this document.",
      );
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const copyResult = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Could not copy automatically. Select the text and copy it manually.");
    }
  };

  const downloadResult = () => {
    if (!output) return;

    const isMarkdown = view === "markdown";
    const blob = new Blob([output], {
      type: isMarkdown ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `datalens-ocr.${isMarkdown ? "md" : "txt"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reset = () => {
    updatePreview(null);
    setFile(null);
    setResult("");
    setError(null);
    setProgress("");
    setCopied(false);
    setView("markdown");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isPdf = file ? isPdfFile(file) : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Text that keeps its layout
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Headings, pretitles, lists, tables, and icons are rebuilt as clean
            Markdown. Files are processed in memory and never stored.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <section className={cardClass}>
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ScanText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Upload an image or PDF</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Read a screenshot, scan, photo, or document up to{" "}
              {MAX_PDF_PAGES} pages.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose an image or PDF to extract text from"
            onChange={(event) => {
              selectFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isProcessing) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-400 dark:bg-emerald-950/30"
                : "border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-zinc-700 dark:hover:bg-emerald-950/20"
            }`}
          >
            {previewUrl ? (
              <span className="flex flex-col items-center gap-3">
                <NextImage
                  src={previewUrl}
                  alt="Selected document preview"
                  width={640}
                  height={320}
                  unoptimized
                  className="max-h-40 w-auto rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
                />
                <span className="text-sm font-semibold">
                  {file?.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {file ? formatBytes(file.size) : ""} · Click to change
                </span>
              </span>
            ) : file ? (
              <span className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                  <FileText className="h-7 w-7" />
                </span>
                <span className="max-w-full truncate text-sm font-semibold">
                  {file.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatBytes(file.size)} · Click to change
                </span>
              </span>
            ) : (
              <span className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <UploadCloud className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold">
                  Drop an image or PDF here
                </span>
                <span className="text-xs text-zinc-500">
                  Or click to browse · JPG, PNG, WEBP up to 5 MB · PDF up to 50
                  MB and {MAX_PDF_PAGES} pages
                </span>
              </span>
            )}
          </button>

          {file && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                  {isPdf ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {isPdf ? "PDF document" : "Image"} ·{" "}
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={isProcessing}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span role="status">{progress || "Preparing document..."}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={!file || isProcessing}
              className={primaryButtonClass}
            >
              {isProcessing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ScanText className="h-4 w-4" />
              )}
              {isProcessing ? "Extracting..." : "Extract text"}
            </button>
            {file && (
              <button
                type="button"
                onClick={reset}
                disabled={isProcessing}
                className={secondaryButtonClass}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {result && (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">Extracted text</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {wordCount} words · ready to copy
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Output format"
                className="flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
              >
                {(["markdown", "plain"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={view === option}
                    onClick={() => setView(option)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      view === option
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
                    }`}
                  >
                    {option === "markdown" ? "Markdown" : "Plain text"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={copyResult}
                className={primaryButtonClass}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                type="button"
                onClick={downloadResult}
                className={secondaryButtonClass}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <div className="p-5">
            <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {output}
            </pre>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {output.length.toLocaleString()} characters ·{" "}
              {view === "markdown" ? "Markdown" : "Plain text"} · This result is
              not saved anywhere.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
