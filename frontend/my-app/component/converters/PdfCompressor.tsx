"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFPageProxy } from "pdfjs-dist";
import {
  Download,
  FileArchive,
  FileText,
  LoaderCircle,
  Minimize2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

interface CompressedPdf {
  blob: Blob;
  url: string;
  fileName: string;
  originalSize: number;
  targetReached: boolean;
  usedOriginal: boolean;
}

const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_PDF_PAGES = 30;
const TARGET_SIZES_KB = [100, 250, 500, 1024, 2048, 5120, 10240];
const MIN_PAGE_BUDGET = 6 * 1024;
const MIN_SCALE = 0.35;
const INITIAL_SCALE = 1.6;

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

function formatTarget(kb: number) {
  return kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not compress a page of this PDF.")),
      "image/jpeg",
      quality,
    );
  });
}

async function compressPage(
  page: PDFPageProxy,
  targetBytes: number,
): Promise<{ blob: Blob; reached: boolean }> {
  let scale = INITIAL_SCALE;
  let smallest: Blob | null = null;

  while (scale >= MIN_SCALE) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser could not prepare a page for compression.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const bestQuality = await canvasToJpeg(canvas, 0.92);

    if (!smallest || bestQuality.size < smallest.size) {
      smallest = bestQuality;
    }

    if (bestQuality.size <= targetBytes) {
      return { blob: bestQuality, reached: true };
    }

    let low = 0.3;
    let high = 0.92;
    let fitting: Blob | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const quality = (low + high) / 2;
      const blob = await canvasToJpeg(canvas, quality);

      if (!smallest || blob.size < smallest.size) {
        smallest = blob;
      }

      if (blob.size <= targetBytes) {
        fitting = blob;
        low = quality;
      } else {
        high = quality;
      }
    }

    if (fitting) {
      return { blob: fitting, reached: true };
    }

    scale = Number((scale * 0.72).toFixed(2));
  }

  if (!smallest) {
    throw new Error("Could not compress a page of this PDF.");
  }

  return { blob: smallest, reached: false };
}

export default function PdfCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState(1024);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressedPdf | null>(null);

  useEffect(
    () => () => {
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    },
    [],
  );

  const clearResult = () => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    setResult(null);
  };

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile || isCompressing) return;

    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Choose a PDF file.");
      return;
    }

    if (nextFile.size > MAX_PDF_SIZE) {
      setError("The PDF must be 50 MB or smaller.");
      return;
    }

    clearResult();
    setFile(nextFile);
    setError(null);
    setProgress("");
  };

  const handleCompress = async () => {
    if (!file || isCompressing) return;

    setIsCompressing(true);
    setError(null);
    setProgress("Reading PDF...");
    clearResult();

    let destroyLoadingTask: (() => Promise<void>) | undefined;

    try {
      const [pdfjs, { PDFDocument }] = await Promise.all([
        import("pdfjs-dist"),
        import("pdf-lib"),
      ]);

      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      });
      destroyLoadingTask = () => loadingTask.destroy();
      const source = await loadingTask.promise;

      if (source.numPages > MAX_PDF_PAGES) {
        throw new Error(
          `PDFs can have up to ${MAX_PDF_PAGES} pages for compression.`,
        );
      }

      const targetBytes = targetKb * 1024;
      const pageBudget = Math.max(
        MIN_PAGE_BUDGET,
        Math.floor((targetBytes * 0.9) / source.numPages),
      );
      const output = await PDFDocument.create();
      let targetReached = true;

      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
        setProgress(
          `Compressing page ${pageNumber} of ${source.numPages}...`,
        );

        const page = await source.getPage(pageNumber);
        const pageSize = page.getViewport({ scale: 1 });
        const compressed = await compressPage(page, pageBudget);

        if (!compressed.reached) {
          targetReached = false;
        }

        const imageBytes = new Uint8Array(
          await compressed.blob.arrayBuffer(),
        );
        const image = await output.embedJpg(imageBytes);
        const outputPage = output.addPage([pageSize.width, pageSize.height]);

        outputPage.drawImage(image, {
          x: 0,
          y: 0,
          width: pageSize.width,
          height: pageSize.height,
        });

        page.cleanup();
      }

      setProgress("Assembling compressed PDF...");

      const pdfBytes = await output.save({ useObjectStreams: true });
      const buffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(buffer).set(pdfBytes);
      const compressedBlob = new Blob([buffer], { type: "application/pdf" });
      const usedOriginal = compressedBlob.size >= file.size;
      const finalBlob = usedOriginal ? file : compressedBlob;
      const url = URL.createObjectURL(finalBlob);

      resultUrlRef.current = url;
      setResult({
        blob: finalBlob,
        url,
        fileName: usedOriginal
          ? file.name
          : `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`,
        originalSize: file.size,
        targetReached: usedOriginal
          ? file.size <= targetBytes
          : targetReached && finalBlob.size <= targetBytes,
        usedOriginal,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not compress this PDF.",
      );
    } finally {
      if (destroyLoadingTask) {
        try {
          await destroyLoadingTask();
        } catch {
          // The document is already gone.
        }
      }

      setIsCompressing(false);
      setProgress("");
    }
  };

  const reset = () => {
    clearResult();
    setFile(null);
    setError(null);
    setProgress("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const reduction = result
    ? Math.max(
        0,
        Math.round(
          ((result.originalSize - result.blob.size) / result.originalSize) * 100,
        ),
      )
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Your PDF stays on your device
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Pages are compressed locally in your browser. The file is never
            uploaded.
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
            <Minimize2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Compress a PDF</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Choose a PDF, pick a target size, and download the smaller file.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF to compress"
            onChange={(event) => {
              selectFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            disabled={isCompressing}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-emerald-950/20"
          >
            {file ? (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                  <FileText className="h-7 w-7" />
                </span>
                <span className="mt-3 max-w-full truncate text-sm font-semibold">
                  {file.name}
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  {formatBytes(file.size)} · Click to change
                </span>
              </>
            ) : (
              <>
                <FileArchive className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                <span className="mt-3 text-sm font-semibold">
                  Select a PDF to compress
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  Up to {MAX_PDF_PAGES} pages · 50 MB maximum
                </span>
              </>
            )}
          </button>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              Target size
            </legend>
            <div className="flex flex-wrap gap-2">
              {TARGET_SIZES_KB.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={isCompressing}
                  aria-pressed={targetKb === size}
                  onClick={() => setTargetKb(size)}
                  className={`min-h-10 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    targetKb === size
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {formatTarget(size)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Target size is approximate. Pages are rebuilt as compressed
              images, so text will no longer be selectable.
            </p>
          </fieldset>

          {file && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatBytes(file.size)} · Target {formatTarget(targetKb)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={isCompressing}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          )}

          {isCompressing && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span role="status">{progress}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCompress}
              disabled={!file || isCompressing}
              className={primaryButtonClass}
            >
              {isCompressing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isCompressing ? "Compressing..." : "Compress PDF"}
            </button>
            {file && (
              <button
                type="button"
                onClick={reset}
                disabled={isCompressing}
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
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Minimize2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Compressed PDF</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {result.usedOriginal
                  ? "Compression would have made this file larger, so the original is kept."
                  : "Your compressed PDF is ready to download."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {result.fileName}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {formatBytes(result.originalSize)} →{" "}
                {formatBytes(result.blob.size)}
                {result.usedOriginal ? "" : ` · ${reduction}% smaller`}
              </p>
              <p
                className={`mt-1 text-xs ${
                  result.targetReached
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {result.targetReached
                  ? "Target size reached."
                  : `This PDF could not reach ${formatTarget(targetKb)} at a readable quality. The smallest practical version is shown.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className={secondaryButtonClass}
              >
                <FileText className="h-4 w-4" />
                Open PDF
              </a>
              <a
                href={result.url}
                download={result.fileName}
                className={primaryButtonClass}
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
