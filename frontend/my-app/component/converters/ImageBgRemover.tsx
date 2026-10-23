"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import {
  Download,
  Eraser,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

interface ResultState {
  blob: Blob;
  url: string;
  size: number;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

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

function isSupported(file: File) {
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function validate(file: File): string | null {
  if (!isSupported(file)) {
    return "Choose a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The image must be 25 MB or smaller.";
  }

  return null;
}

const checkerboardStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, rgba(156,163,175,0.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(156,163,175,0.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(156,163,175,0.25) 75%), linear-gradient(-45deg, transparent 75%, rgba(156,163,175,0.25) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
};

export default function ImageBgRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }

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

  const updateOriginal = (nextFile: File | null) => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }

    if (nextFile) {
      const url = URL.createObjectURL(nextFile);
      originalUrlRef.current = url;
      setOriginalUrl(url);
      return;
    }

    setOriginalUrl(null);
  };

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile || isProcessing) return;

    const validationError = validate(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    clearResult();
    updateOriginal(nextFile);
    setFile(nextFile);
    setError(null);
    setProgress("");
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const removeBackground = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProgress("Loading model and removing background...");
    clearResult();

    try {
      const { removeBackground: removeBg } = await import(
        "@imgly/background-removal"
      );

      setProgress("Processing image...");
      const blob = await removeBg(file);

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      setResult({
        blob,
        url,
        size: blob.size,
      });
      setProgress("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not remove the background from this image.",
      );
      setProgress("");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.url;
    link.download = `${file?.name.replace(/\.[^.]+$/, "") || "image"}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const reset = () => {
    clearResult();
    updateOriginal(null);
    setFile(null);
    setError(null);
    setProgress("");
    setIsDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Runs entirely in your browser
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            The AI model runs on your device. Your image is never uploaded.
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
            <Eraser className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Remove image background</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload a photo and get a transparent PNG in seconds.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose an image to remove the background"
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
            {originalUrl ? (
              <span className="flex flex-col items-center gap-3">
                <NextImage
                  src={originalUrl}
                  alt="Selected image preview"
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
            ) : (
              <span className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <UploadCloud className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold">
                  Drop an image here
                </span>
                <span className="text-xs text-zinc-500">
                  Or click to browse · JPG, PNG, WEBP up to 25 MB
                </span>
              </span>
            )}
          </button>

          {file && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatBytes(file.size)} · PNG output
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
              <span role="status">{progress || "Preparing..."}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={removeBackground}
              disabled={!file || isProcessing}
              className={primaryButtonClass}
            >
              {isProcessing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Eraser className="h-4 w-4" />
              )}
              {isProcessing ? "Removing..." : "Remove background"}
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

      {result && originalUrl && (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">Background removed</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Result is a transparent PNG · {formatBytes(result.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={removeBackground}
                disabled={isProcessing}
                className={secondaryButtonClass}
              >
                <RefreshCw className="h-4 w-4" />
                Process again
              </button>
              <button
                type="button"
                onClick={downloadResult}
                className={primaryButtonClass}
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <figure className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                <figcaption className="text-sm font-medium">
                  Original
                </figcaption>
                <span className="text-xs text-zinc-500">
                  {file ? formatBytes(file.size) : ""}
                </span>
              </div>
              <div className="relative h-72 w-full">
                <NextImage
                  src={originalUrl}
                  alt="Original image"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </figure>

            <figure className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                <figcaption className="text-sm font-medium">
                  Background removed
                </figcaption>
                <span className="text-xs text-zinc-500">
                  {formatBytes(result.size)}
                </span>
              </div>
              <div
                className="relative h-72 w-full"
                style={checkerboardStyle}
              >
                <NextImage
                  src={result.url}
                  alt="Image with background removed"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </figure>
          </div>
        </section>
      )}
    </div>
  );
}
