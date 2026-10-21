"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import {
  Download,
  FileArchive,
  FileImage,
  FilePlus2,
  Image as ImageIcon,
  RefreshCw,
  Upload,
} from "lucide-react";

type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

interface ConvertedImage {
  blob: Blob;
  url: string;
}

const FORMATS: { value: ImageFormat; label: string; extension: string }[] = [
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/jpeg", label: "JPG", extension: "jpg" },
  { value: "image/webp", label: "WebP", extension: "webp" },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_PDF_IMAGES = 30;
const MAX_PDF_PAGES = 50;
const MAX_TOTAL_IMAGE_SIZE = 100 * 1024 * 1024;

type ConversionMode = "image" | "images-to-pdf" | "pdf-to-images";

interface ConvertedPage {
  name: string;
  url: string;
}

const panelClass =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
const primaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-950";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function convertImage(
  image: HTMLImageElement,
  format: ImageFormat,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not prepare the image for conversion.");
  }

  if (format === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The image could not be converted. Try another format."));
          return;
        }
        if (blob.type !== format) {
          reject(
            new Error(
              `Your browser does not support ${FORMATS.find((item) => item.value === format)?.label ?? "this"} output.`,
            ),
          );
          return;
        }
        resolve(blob);
      },
      format,
      format === "image/jpeg" || format === "image/webp" ? 0.92 : undefined,
    );
  });
}

function revokeUrls(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls.length = 0;
}

async function imageFileToPng(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(`Could not process ${file.name}.`);
    }
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error(`Could not process ${file.name}.`));
      }, "image/png");
    });
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImageConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const convertedUrlRef = useRef<string | null>(null);
  const pdfOutputUrlsRef = useRef<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [mode, setMode] = useState<ConversionMode>("image");
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [converted, setConverted] = useState<ConvertedImage | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pdfOutputUrls = pdfOutputUrlsRef.current;
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      if (convertedUrlRef.current) {
        URL.revokeObjectURL(convertedUrlRef.current);
      }
      revokeUrls(pdfOutputUrls);
    };
  }, []);

  const setInputFile = (nextFile: File | undefined) => {
    if (isConverting) {
      return;
    }
    if (!nextFile) {
      return;
    }

    if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    convertedUrlRef.current = null;
    setConverted(null);
    setError(null);
    setFile(null);
    setPreviewUrl(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("Image is too large. The maximum file size is 25 MB.");
      return;
    }

    setFile(nextFile);
    const url = URL.createObjectURL(nextFile);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  const clearPdfOutputs = () => {
    revokeUrls(pdfOutputUrlsRef.current);
    setConvertedPages([]);
  };

  const changeMode = (nextMode: ConversionMode) => {
    if (isConverting) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    previewUrlRef.current = null;
    convertedUrlRef.current = null;
    clearPdfOutputs();
    setMode(nextMode);
    setFile(null);
    setImages([]);
    setPdfFile(null);
    setPreviewUrl(null);
    setConverted(null);
    setError(null);
    setProgress("");
    if (inputRef.current) inputRef.current.value = "";
    if (imagesInputRef.current) imagesInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const setImageFiles = (selected: FileList | null) => {
    if (isConverting || !selected) return;
    const nextImages = Array.from(selected);
    setError(null);
    clearPdfOutputs();
    if (nextImages.length === 0) return;
    if (nextImages.length > MAX_PDF_IMAGES) {
      setImages([]);
      setError(`Choose no more than ${MAX_PDF_IMAGES} images at a time.`);
      return;
    }
    if (nextImages.some((item) => !ACCEPTED_TYPES.includes(item.type))) {
      setImages([]);
      setError("Choose PNG, JPG, or WebP images only.");
      return;
    }
    if (nextImages.some((item) => item.size > MAX_FILE_SIZE)) {
      setImages([]);
      setError("Each image must be 25 MB or smaller.");
      return;
    }
    if (nextImages.reduce((total, item) => total + item.size, 0) > MAX_TOTAL_IMAGE_SIZE) {
      setImages([]);
      setError("The total size of all selected images must be 100 MB or less.");
      return;
    }
    setImages(nextImages);
  };

  const setPdfInputFile = (nextFile: File | undefined) => {
    if (isConverting || !nextFile) return;
    clearPdfOutputs();
    setError(null);
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setPdfFile(null);
      setError("Choose a PDF file.");
      return;
    }
    if (nextFile.size > MAX_PDF_SIZE) {
      setPdfFile(null);
      setError("PDF is too large. The maximum file size is 50 MB.");
      return;
    }
    setPdfFile(nextFile);
  };

  const handleConvert = async () => {
    if (!file || !previewUrl || isConverting) {
      if (!file) {
        setError("Choose an image before converting.");
      }
      return;
    }

    setIsConverting(true);
    setProgress("Preparing image...");
    setError(null);

    try {
      const image = new window.Image();
      image.src = previewUrl;
      await image.decode();

      const blob = await convertImage(image, format);
      if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
      const url = URL.createObjectURL(blob);
      convertedUrlRef.current = url;
      setConverted({ blob, url });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The image could not be converted.",
      );
    } finally {
      setIsConverting(false);
      setProgress("");
    }
  };

  const handleImagesToPdf = async () => {
    if (images.length === 0 || isConverting) return;
    setIsConverting(true);
    setError(null);
    setProgress("Creating PDF...");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      for (const [index, imageFile] of images.entries()) {
        setProgress(`Adding image ${index + 1} of ${images.length}...`);
        const bytes =
          imageFile.type === "image/webp"
            ? await imageFileToPng(imageFile)
            : new Uint8Array(await imageFile.arrayBuffer());
        const embedded =
          imageFile.type === "image/jpeg"
            ? await pdf.embedJpg(bytes)
            : await pdf.embedPng(bytes);
        const maxPageDimension = 14400;
        const scale = Math.min(
          0.75,
          maxPageDimension / embedded.width,
          maxPageDimension / embedded.height,
        );
        const page = pdf.addPage([
          embedded.width * scale,
          embedded.height * scale,
        ]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
      }
      const pdfBytes = await pdf.save();
      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(pdfBuffer).set(pdfBytes);
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      pdfOutputUrlsRef.current.push(url);
      setConvertedPages([{ name: "images.pdf", url }]);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create the PDF.",
      );
    } finally {
      setIsConverting(false);
      setProgress("");
    }
  };

  const handlePdfToImages = async () => {
    if (!pdfFile || isConverting) return;
    setIsConverting(true);
    setError(null);
    clearPdfOutputs();
    let destroyLoadingTask: (() => Promise<void>) | undefined;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await pdfFile.arrayBuffer()),
      });
      destroyLoadingTask = () => loadingTask.destroy();
      const pdfDocument = await loadingTask.promise;
      if (pdfDocument.numPages > MAX_PDF_PAGES) {
        throw new Error(`PDFs can have up to ${MAX_PDF_PAGES} pages.`);
      }
      const pages: ConvertedPage[] = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        setProgress(`Converting page ${pageNumber} of ${pdfDocument.numPages}...`);
        const page = await pdfDocument.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const maxTotalPixels = 100_000_000;
        const maxPixelsPerPage = maxTotalPixels / pdfDocument.numPages;
        const scale = Math.min(
          2,
          2048 / Math.max(baseViewport.width, baseViewport.height),
          Math.sqrt(
            maxPixelsPerPage /
              (baseViewport.width * baseViewport.height),
          ),
        );
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error(`Could not render PDF page ${pageNumber}.`);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => result ? resolve(result) : reject(new Error(`Could not convert PDF page ${pageNumber}.`)),
            "image/png",
          );
        });
        const url = URL.createObjectURL(blob);
        pdfOutputUrlsRef.current.push(url);
        pages.push({
          name: `${pdfFile.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.png`,
          url,
        });
        page.cleanup();
      }
      setConvertedPages(pages);
    } catch (caught) {
      clearPdfOutputs();
      setError(
        caught instanceof Error ? caught.message : "Could not convert this PDF.",
      );
    } finally {
      if (destroyLoadingTask) {
        try {
          await destroyLoadingTask();
        } catch (caught) {
          setError(
            caught instanceof Error
              ? `PDF cleanup failed: ${caught.message}`
              : "PDF cleanup failed.",
          );
        }
      }
      setIsConverting(false);
      setProgress("");
    }
  };

  const handleDownloadPagesZip = async () => {
    if (convertedPages.length < 2 || isZipping) return;
    setIsZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const page of convertedPages) {
        const response = await fetch(page.url);
        if (!response.ok) {
          throw new Error(`Could not read ${page.name} for ZIP download.`);
        }
        zip.file(page.name, await response.blob());
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdfFile?.name.replace(/\.pdf$/i, "") || "pdf-pages"}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create the ZIP file.",
      );
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownload = () => {
    if (!converted || !file) {
      return;
    }

    const extension = FORMATS.find((item) => item.value === format)?.extension;
    if (!extension) {
      setError("The selected image format is not supported.");
      return;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "converted-image";
    const link = document.createElement("a");
    link.href = converted.url;
    link.download = `${baseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleReset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(null);
    setImages([]);
    setPdfFile(null);
    setPreviewUrl(null);
    if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    convertedUrlRef.current = null;
    setConverted(null);
    clearPdfOutputs();
    setError(null);
    setIsConverting(false);
    setProgress("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (imagesInputRef.current) imagesInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="group"
        aria-label="Conversion type"
      >
        {[
          { id: "image" as const, label: "Image format" },
          { id: "images-to-pdf" as const, label: "Images to PDF" },
          { id: "pdf-to-images" as const, label: "PDF to images" },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isConverting}
            aria-pressed={mode === option.id}
            onClick={() => changeMode(option.id)}
            className={`min-h-11 rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === option.id
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "image" && (
        <>
      <div className={`${panelClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}>
        <div>
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300">
            Free Tool
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight">
            Choose an image format
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Convert PNG, JPG, and WebP images in your browser. Files stay on your device.
          </p>
        </div>

        <div
          className="flex w-full flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 sm:w-auto dark:border-zinc-700 dark:bg-zinc-950"
          role="group"
          aria-label="Output image format"
        >
          {FORMATS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isConverting}
              aria-pressed={format === option.value}
              onClick={() => {
                setFormat(option.value);
                if (convertedUrlRef.current) {
                  URL.revokeObjectURL(convertedUrlRef.current);
                  convertedUrlRef.current = null;
                }
                setConverted(null);
                setError(null);
              }}
              className={`min-h-9 flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition sm:flex-none ${
                format === option.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={`${panelClass} flex min-h-80 flex-col`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Original image
            </span>
            <div className="flex items-center gap-3">
              {file && (
                <span className="max-w-40 truncate text-xs text-zinc-500">
                  {file.name} · {formatBytes(file.size)}
                </span>
              )}
              <button
                type="button"
                disabled={isConverting}
                onClick={() => inputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-emerald-700 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"
              >
                <Upload className="h-3.5 w-3.5" />
                {file ? "Change image" : "Upload image"}
              </button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label="Upload a PNG, JPG, or WebP image"
            onChange={(event) => {
              setInputFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            {previewUrl ? (
              <NextImage
                src={previewUrl}
                alt={`Preview of ${file?.name ?? "selected image"}`}
                width={1200}
                height={800}
                unoptimized
                className="max-h-80 max-w-full rounded-lg object-contain"
              />
            ) : (
              <button
                type="button"
                disabled={isConverting}
                onClick={() => inputRef.current?.click()}
                className="flex min-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-emerald-950/20"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ImageIcon className="h-6 w-6" />
                </span>
                <span className="mt-3 text-sm font-semibold">
                  Select an image to convert
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  PNG, JPG, or WebP · Maximum 25 MB
                </span>
              </button>
            )}
          </div>
        </section>

        <section className={`${panelClass} flex min-h-80 flex-col`}>
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Converted {FORMATS.find((item) => item.value === format)?.label}
            </span>
            {converted && (
              <span className="text-xs text-zinc-500">
                {formatBytes(converted.blob.size)}
              </span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            {converted ? (
              <NextImage
                src={converted.url}
                alt={`Converted ${format} image`}
                width={1200}
                height={800}
                unoptimized
                className="max-h-80 max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600">
                <FileImage className="h-10 w-10" />
                <p className="mt-3 text-sm">Your converted image appears here</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          disabled={!file || isConverting}
          className={primaryButton}
        >
          <RefreshCw className={`h-4 w-4 ${isConverting ? "animate-spin" : ""}`} />
          {isConverting ? "Converting..." : "Convert image"}
        </button>
        {converted && (
          <button
            type="button"
            onClick={handleDownload}
            className={primaryButton}
          >
            <Download className="h-4 w-4" />
            Download {FORMATS.find((item) => item.value === format)?.label}
          </button>
        )}
        {file && (
          <button
            type="button"
            disabled={isConverting}
            onClick={handleReset}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Image conversion runs locally in your browser. Converting transparent
        images to JPG fills transparent areas with white.
      </p>
        </>
      )}

      {mode === "images-to-pdf" && (
        <section className={`${panelClass} flex flex-col gap-5 p-4 sm:p-6`}>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Combine images into a PDF</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Select up to {MAX_PDF_IMAGES} PNG, JPG, or WebP images. Each image becomes a page in one PDF.
            </p>
          </div>
          <input
            ref={imagesInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label="Choose images to combine into a PDF"
            onChange={(event) => {
              setImageFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={isConverting}
            onClick={() => imagesInputRef.current?.click()}
            className="flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-emerald-950/20"
          >
            <FilePlus2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
            <span className="mt-3 text-sm font-semibold">
              {images.length
                ? `${images.length} image${images.length === 1 ? "" : "s"} selected`
                : "Select multiple images"}
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              PNG, JPG, or WebP · Up to 25 MB per image and 100 MB total
            </span>
          </button>
          {images.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {images.map((image, index) => (
                <li
                  key={`${image.name}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <span className="truncate">{index + 1}. {image.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">{formatBytes(image.size)}</span>
                </li>
              ))}
            </ul>
          )}
          {error && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          {progress && <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">{progress}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleImagesToPdf}
              disabled={!images.length || isConverting}
              className={primaryButton}
            >
              <RefreshCw className={`h-4 w-4 ${isConverting ? "animate-spin" : ""}`} />
              {isConverting ? "Creating PDF..." : "Create PDF"}
            </button>
            {convertedPages[0] && (
              <a
                href={convertedPages[0].url}
                download={convertedPages[0].name}
                className={primaryButton}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
            {(images.length > 0 || convertedPages.length > 0) && (
              <button
                type="button"
                disabled={isConverting}
                onClick={handleReset}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Files are combined locally in your browser and are not uploaded.
          </p>
        </section>
      )}

      {mode === "pdf-to-images" && (
        <section className={`${panelClass} flex flex-col gap-5 p-4 sm:p-6`}>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Convert PDF pages to images</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Render each page of a PDF as a separate PNG image, ready to download.
            </p>
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF to convert into images"
            onChange={(event) => {
              setPdfInputFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={isConverting}
            onClick={() => pdfInputRef.current?.click()}
            className="flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-emerald-950/20"
          >
            <FileImage className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
            <span className="mt-3 text-sm font-semibold">
              {pdfFile ? pdfFile.name : "Select a PDF"}
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              PDF · Maximum 50 MB and {MAX_PDF_PAGES} pages
            </span>
          </button>
          {error && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          {progress && <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">{progress}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePdfToImages}
              disabled={!pdfFile || isConverting}
              className={primaryButton}
            >
              <RefreshCw className={`h-4 w-4 ${isConverting ? "animate-spin" : ""}`} />
              {isConverting ? "Converting pages..." : "Convert to PNG"}
            </button>
            {pdfFile && (
              <button
                type="button"
                disabled={isConverting}
                onClick={handleReset}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
            )}
          </div>
          {convertedPages.length > 0 && (
            <>
              {convertedPages.length > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadPagesZip}
                  disabled={isZipping}
                  className={primaryButton}
                >
                  <FileArchive className={`h-4 w-4 ${isZipping ? "animate-pulse" : ""}`} />
                  {isZipping ? "Preparing ZIP..." : "Download all as ZIP"}
                </button>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {convertedPages.map((page) => (
                  <div key={page.name} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <NextImage
                      src={page.url}
                      alt={page.name}
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-48 w-full bg-zinc-100 object-contain dark:bg-zinc-950"
                    />
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="truncate text-sm font-medium">{page.name}</span>
                      <a href={page.url} download={page.name} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            PDF pages are rendered locally in your browser. Files are not uploaded.
          </p>
        </section>
      )}
    </div>
  );
}
