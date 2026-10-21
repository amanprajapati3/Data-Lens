"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Download, FileArchive, ImageDown, RefreshCw } from "lucide-react";

type OutputFormat = "image/jpeg" | "image/webp";

interface CompressedImage {
  blob: Blob;
  fileName: string;
  previewUrl: string;
  sourceSize: number;
  targetReached: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 20;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const TARGET_SIZES = [10, 25, 50, 100, 200, 500, 1024];
const FORMATS: { value: OutputFormat; label: string; extension: string }[] = [
  { value: "image/jpeg", label: "JPG", extension: "jpg" },
  { value: "image/webp", label: "WebP", extension: "webp" },
];
const buttonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50";

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Your browser could not compress this image."));
        } else if (blob.type !== format) {
          reject(new Error(`Your browser does not support ${format} compression.`));
        } else {
          resolve(blob);
        }
      },
      format,
      quality,
    );
  });
}

async function compressImage(
  file: File,
  targetBytes: number,
  format: OutputFormat,
): Promise<{ blob: Blob; targetReached: boolean }> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = sourceUrl;
    await image.decode();

    let width = image.naturalWidth;
    let height = image.naturalHeight;
    const contextCanvas = document.createElement("canvas");
    const context = contextCanvas.getContext("2d");
    if (!context) throw new Error(`Could not prepare ${file.name} for compression.`);

    let smallestBlob: Blob | null = null;
    let bestUnderTarget: Blob | null = null;
    const smallestDimension = Math.min(320, width, height);

    while (true) {
      contextCanvas.width = width;
      contextCanvas.height = height;
      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      } else {
        context.clearRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);

      let low = 0.05;
      let high = 0.95;
      let smallestAtDimensions: Blob | null = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const quality = (low + high) / 2;
        const blob = await canvasBlob(contextCanvas, format, quality);
        if (!smallestAtDimensions || blob.size < smallestAtDimensions.size) {
          smallestAtDimensions = blob;
        }
        if (blob.size <= targetBytes) {
          if (!bestUnderTarget || blob.size > bestUnderTarget.size) {
            bestUnderTarget = blob;
          }
          low = quality;
        } else {
          high = quality;
        }
      }

      if (smallestAtDimensions && (!smallestBlob || smallestAtDimensions.size < smallestBlob.size)) {
        smallestBlob = smallestAtDimensions;
      }
      if (bestUnderTarget) return { blob: bestUnderTarget, targetReached: true };

      const nextWidth = Math.floor(width * 0.8);
      const nextHeight = Math.floor(height * 0.8);
      if (Math.min(nextWidth, nextHeight) < smallestDimension) break;
      width = nextWidth;
      height = nextHeight;
    }

    if (!smallestBlob) throw new Error(`Could not compress ${file.name}.`);
    return { blob: smallestBlob, targetReached: false };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function ImageCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<CompressedImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [targetKb, setTargetKb] = useState(100);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      resultsRef.current.forEach((result) => URL.revokeObjectURL(result.previewUrl));
    },
    [],
  );

  const updateResults = (next: CompressedImage[]) => {
    resultsRef.current.forEach((result) => URL.revokeObjectURL(result.previewUrl));
    resultsRef.current = next;
    setResults(next);
  };

  const selectFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || isCompressing) return;
    const selected = Array.from(selectedFiles);
    setError(null);
    updateResults([]);
    if (selected.length > MAX_FILES) {
      setFiles([]);
      setError(`Choose no more than ${MAX_FILES} images at a time.`);
      return;
    }
    if (selected.some((file) => !ACCEPTED_TYPES.includes(file.type))) {
      setFiles([]);
      setError("Choose PNG, JPG, or WebP images only.");
      return;
    }
    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      setFiles([]);
      setError("Each image must be 25 MB or smaller.");
      return;
    }
    if (selected.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
      setFiles([]);
      setError("The total size of all selected images must be 100 MB or less.");
      return;
    }
    setFiles(selected);
  };

  const handleCompress = async () => {
    if (!files.length || isCompressing) return;
    setIsCompressing(true);
    setError(null);
    updateResults([]);
    const compressed: CompressedImage[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Compressing image ${index + 1} of ${files.length}...`);
        const result = await compressImage(file, targetKb * 1024, format);
        const option = FORMATS.find((item) => item.value === format);
        if (!option) throw new Error("Select a supported output format.");
        compressed.push({
          blob: result.blob,
          fileName: `${file.name.replace(/\.[^.]+$/, "") || "image"}.${option.extension}`,
          previewUrl: URL.createObjectURL(result.blob),
          sourceSize: file.size,
          targetReached: result.targetReached,
        });
      }
      updateResults(compressed);
      if (compressed.some((result) => !result.targetReached)) {
        setError("Some images could not reach the selected target size, even at the smallest practical dimensions and quality. Their smallest compressed versions are shown below.");
      }
    } catch (caught) {
      compressed.forEach((result) => URL.revokeObjectURL(result.previewUrl));
      setError(caught instanceof Error ? caught.message : "Could not compress the images.");
    } finally {
      setIsCompressing(false);
      setProgress("");
    }
  };

  const handleDownloadZip = async () => {
    if (results.length < 2 || isZipping) return;
    setIsZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      results.forEach((result) => zip.file(result.fileName, result.blob));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compressed-images.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the ZIP file.");
    } finally {
      setIsZipping(false);
    }
  };

  const reset = () => {
    setFiles([]);
    updateResults([]);
    setError(null);
    setProgress("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Compress images to a target size</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select one or more images, choose an approximate maximum size, and compress them locally in your browser.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Choose images to compress"
          onChange={(event) => {
            selectFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={isCompressing}
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-emerald-950/20"
        >
          <ImageDown className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
          <span className="mt-3 text-sm font-semibold">
            {files.length ? `${files.length} image${files.length === 1 ? "" : "s"} selected` : "Select images to compress"}
          </span>
          <span className="mt-1 text-xs text-zinc-500">
            Up to {MAX_FILES} images · 25 MB each · 100 MB total
          </span>
        </button>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Maximum target size per image</legend>
            <div className="flex flex-wrap gap-2">
              {TARGET_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={isCompressing}
                  aria-pressed={targetKb === size}
                  onClick={() => setTargetKb(size)}
                  className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    targetKb === size
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {size >= 1024 ? `${size / 1024} MB` : `${size} KB`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">Target size is approximate and depends on the image content.</p>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Output format</legend>
            <div className="flex gap-2">
              {FORMATS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isCompressing}
                  aria-pressed={format === option.value}
                  onClick={() => setFormat(option.value)}
                  className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    format === option.value
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {files.length > 0 && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex min-w-0 justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-zinc-500">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        )}

        {error && <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        {progress && <p role="status" className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{progress}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleCompress} disabled={!files.length || isCompressing} className={buttonClass}>
            <RefreshCw className={`h-4 w-4 ${isCompressing ? "animate-spin" : ""}`} />
            {isCompressing ? "Compressing..." : "Compress images"}
          </button>
          {files.length > 0 && (
            <button type="button" onClick={reset} disabled={isCompressing} className="min-h-10 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Clear
            </button>
          )}
        </div>
      </section>

      {results.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">Compressed image previews</h2>
            {results.length > 1 && (
              <button type="button" onClick={handleDownloadZip} disabled={isZipping} className={buttonClass}>
                <FileArchive className={`h-4 w-4 ${isZipping ? "animate-pulse" : ""}`} />
                {isZipping ? "Preparing ZIP..." : "Download all as ZIP"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {results.map((result) => (
              <article key={result.fileName} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <NextImage src={result.previewUrl} alt={`Compressed preview of ${result.fileName}`} width={1200} height={800} unoptimized className="h-56 w-full bg-zinc-100 object-contain dark:bg-zinc-950" />
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{result.fileName}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatBytes(result.sourceSize)} → {formatBytes(result.blob.size)}
                      {result.targetReached ? "" : " · target not reached"}
                    </p>
                  </div>
                  <a href={result.previewUrl} download={result.fileName} className={buttonClass}>
                    <Download className="h-4 w-4" />
                    Download image
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
