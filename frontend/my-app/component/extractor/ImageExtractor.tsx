"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";

interface ImageExtractorProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onExtract: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE_LABEL = "5 MB";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function validateImageFile(file: File): string | null {
  const type = file.type.toLowerCase().trim();
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    return "Unsupported file type. Please choose a JPEG, PNG, or WEBP file.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `File is too large. Maximum file size is ${MAX_IMAGE_SIZE_LABEL}.`;
  }

  return null;
}

export default function ImageExtractor({
  selectedFile,
  onFileChange,
  onExtract,
  isLoading,
  disabled = false,
}: ImageExtractorProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isExtractDisabled = disabled || isLoading || !selectedFile;

  const fileInfo = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return {
      name: selectedFile.name,
      size: selectedFile.size,
      sizeLabel: formatFileSize(selectedFile.size),
    };
  }, [selectedFile]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setError(null);
    onFileChange(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileChange(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setError(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExtractClick = () => {
    if (selectedFile && !isLoading && !disabled) {
      onExtract();
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Upload Screenshot
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The screenshot will be analyzed and converted into structured website
          JSON.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors sm:py-10",
          isDragging
            ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/40"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="sr-only"
          disabled={disabled}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <ImageIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Drag an image here
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Or click to browse files
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Accepted formats: JPEG, PNG, or WEBP • Max size: {MAX_IMAGE_SIZE_LABEL}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {selectedFile && fileInfo && (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {previewUrl && (
              <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 sm:h-20 sm:w-20">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="max-w-[200px] truncate text-sm font-medium text-gray-900 dark:text-gray-100 sm:max-w-[300px] md:max-w-[400px]">
                {fileInfo.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileInfo.sizeLabel} ({fileInfo.size.toLocaleString()} bytes)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={isLoading || disabled}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleExtractClick}
        disabled={isExtractDisabled}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Extracting..." : "Extract From Screenshot"}
      </button>
    </div>
  );
}