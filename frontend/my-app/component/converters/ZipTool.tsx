"use client";

import { useRef, useState } from "react";
import {
  Archive,
  Download,
  FileArchive,
  File as FileIcon,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";

interface SelectedFile {
  file: File;
  path: string;
}

interface ExtractedFile {
  path: string;
  blob: Blob | null;
}

interface FolderTreeNode {
  name: string;
  folders: Map<string, FolderTreeNode>;
  files: { path: string; size: number }[];
}

interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: (options?: {
    mode?: "read" | "readwrite";
  }) => Promise<FileSystemDirectoryHandle>;
}

const MAX_FILES = 500;
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;
const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;
const MAX_EXTRACTED_SIZE = 250 * 1024 * 1024;

const cardClass =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
const buttonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-emerald-400";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isSafeArchivePath(path: string) {
  const normalized = path.replace(/\\/g, "/");
  return (
    normalized.length > 0 &&
    !normalized.startsWith("/") &&
    !/^[a-zA-Z]:/.test(normalized) &&
    !normalized.split("/").some((part) => part === "..")
  );
}

function createFolderTree(files: ExtractedFile[]): FolderTreeNode {
  const root: FolderTreeNode = {
    name: "",
    folders: new Map(),
    files: [],
  };

  files.forEach(({ path, blob }) => {
    const parts = normalizePath(path).split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isDirectory = blob === null || index < parts.length - 1;
      if (isDirectory) {
        let folder = current.folders.get(part);
        if (!folder) {
          folder = { name: part, folders: new Map(), files: [] };
          current.folders.set(part, folder);
        }
        current = folder;
      } else if (blob) {
        current.files.push({ path, size: blob.size });
      }
    });
  });

  return root;
}

function FolderTree({ folder }: { folder: FolderTreeNode }) {
  const folders = Array.from(folder.folders.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const files = [...folder.files].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  return (
    <ul className="space-y-1">
      {folders.map((child) => (
        <li key={child.name}>
          <details open>
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">
              <Folder className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="truncate">{child.name}</span>
            </summary>
            <div className="ml-3 border-l border-zinc-200 pl-3 dark:border-zinc-700">
              <FolderTree folder={child} />
            </div>
          </details>
        </li>
      ))}
      {files.map((file) => (
        <li
          key={file.path}
          className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm"
        >
          <span className="flex min-w-0 items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <FileIcon className="h-4 w-4 shrink-0 text-zinc-400" />
            <span className="truncate">{file.path.split("/").pop()}</span>
          </span>
          <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
            {formatBytes(file.size)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ZipTool() {
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [archive, setArchive] = useState<Blob | null>(null);
  const [archiveName, setArchiveName] = useState("");
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [extractedFolderName, setExtractedFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addFiles = (selected: FileList | null, fromFolder: boolean) => {
    if (!selected || isCreating || isExtracting) return;

    const incoming = Array.from(selected).map((file) => ({
      file,
      path: normalizePath(
        fromFolder ? file.webkitRelativePath || file.name : file.name,
      ),
    }));

    if (incoming.some(({ path }) => !isSafeArchivePath(path))) {
      setError("One or more selected files have an invalid path.");
      return;
    }

    const combined = new Map(files.map((item) => [item.path, item]));
    incoming.forEach((item) => combined.set(item.path, item));
    const next = Array.from(combined.values());
    const totalSize = next.reduce((total, item) => total + item.file.size, 0);

    if (next.length > MAX_FILES) {
      setError(`Choose no more than ${MAX_FILES} files for one ZIP.`);
      return;
    }

    if (totalSize > MAX_UPLOAD_SIZE) {
      setError("The total size of selected files must be 100 MB or less.");
      return;
    }

    setError(null);
    setArchive(null);
    setArchiveName("");
    setFiles(next);
  };

  const createArchive = async () => {
    if (!files.length || isCreating) return;

    setIsCreating(true);
    setError(null);
    setArchive(null);

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      files.forEach(({ file, path }) => zip.file(path, file));
      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        ({ percent }) => setProgress(`Creating ZIP... ${Math.round(percent)}%`),
      );
      const name = "datalens-archive.zip";
      setArchive(blob);
      setArchiveName(name);
      downloadBlob(blob, name);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not create the ZIP archive.",
      );
    } finally {
      setIsCreating(false);
      setProgress("");
    }
  };

  const extractArchive = async (file: File) => {
    setExtractedFiles([]);
    setError(null);

    if (file.size > MAX_ARCHIVE_SIZE) {
      setError("The ZIP file must be 50 MB or smaller.");
      return;
    }

    setIsExtracting(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files);
      const fileEntries = entries.filter((entry) => !entry.dir);

      if (!fileEntries.length) {
        throw new Error("This ZIP archive does not contain any files.");
      }

      if (fileEntries.length > MAX_FILES) {
        throw new Error(`This archive contains more than ${MAX_FILES} files.`);
      }

      if (
        entries.some(
          (entry) =>
            !isSafeArchivePath(entry.unsafeOriginalName ?? entry.name),
        )
      ) {
        throw new Error(
          "This archive contains an unsafe file path and cannot be extracted.",
        );
      }

      const normalizedEntries = entries.map((entry) => ({
        entry,
        path: normalizePath(entry.name),
      }));
      const firstPath = normalizedEntries[0]?.path ?? "";
      const candidateRoot = firstPath.split("/")[0];
      const hasSingleRootDirectory =
        Boolean(candidateRoot) &&
        fileEntries.every((entry) =>
          normalizePath(entry.name).startsWith(`${candidateRoot}/`),
        ) &&
        normalizedEntries.every(
          ({ path }) =>
            path === candidateRoot || path.startsWith(`${candidateRoot}/`),
        );
      const removeRoot = (path: string) =>
        hasSingleRootDirectory
          ? path.slice(candidateRoot.length).replace(/^\/+/, "")
          : path;
      const output: ExtractedFile[] = normalizedEntries
        .filter(({ entry }) => entry.dir)
        .map(({ path }) => ({ path: removeRoot(path), blob: null }))
        .filter(({ path }) => path.length > 0);
      let totalSize = 0;

      for (const [index, entry] of fileEntries.entries()) {
        setProgress(
          `Extracting file ${index + 1} of ${fileEntries.length}...`,
        );
        const blob = await entry.async("blob");
        totalSize += blob.size;

        if (totalSize > MAX_EXTRACTED_SIZE) {
          throw new Error("Extracted files cannot exceed 250 MB in total.");
        }

        output.push({ path: removeRoot(normalizePath(entry.name)), blob });
      }

      setExtractedFiles(output);
      setExtractedFolderName(
        file.name.replace(/\.zip$/i, "") || "extracted-files",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not read this ZIP archive.",
      );
    } finally {
      setIsExtracting(false);
      setProgress("");
    }
  };

  const handleZipUpload = (selected: FileList | null) => {
    const file = selected?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Choose a ZIP file to extract.");
      return;
    }

    void extractArchive(file);
  };

  const clearFiles = () => {
    setFiles([]);
    setArchive(null);
    setArchiveName("");
    setError(null);
  };

  const extractToFolder = async () => {
    if (
      !extractedFiles.length ||
      isSavingFolder ||
      isCreating ||
      isExtracting
    ) {
      return;
    }

    setError(null);
    setProgress("");
    const directoryPicker = (window as WindowWithDirectoryPicker)
      .showDirectoryPicker;

    if (!directoryPicker) {
      setError(
        "Folder extraction is not supported by this browser. Use Chrome or Edge to save the files as a folder.",
      );
      return;
    }

    setIsSavingFolder(true);
    try {
      const destination = await directoryPicker.call(window, {
        mode: "readwrite",
      });
      const outputFolder = await destination.getDirectoryHandle(
        extractedFolderName,
        { create: true },
      );
      const directories = extractedFiles.filter((entry) => entry.blob === null);
      const filesToSave = extractedFiles.filter(
        (entry): entry is ExtractedFile & { blob: Blob } => entry.blob !== null,
      );

      for (const entry of directories) {
        let directory = outputFolder;
        const parts = normalizePath(entry.path).split("/").filter(Boolean);
        for (const part of parts) {
          directory = await directory.getDirectoryHandle(part, {
            create: true,
          });
        }
      }

      for (const [index, entry] of filesToSave.entries()) {
        setProgress(`Saving file ${index + 1} of ${filesToSave.length}...`);
        const parts = normalizePath(entry.path).split("/").filter(Boolean);
        const filename = parts.pop();
        if (!filename) {
          throw new Error("An extracted file has an invalid path.");
        }

        let directory = outputFolder;
        for (const part of parts) {
          directory = await directory.getDirectoryHandle(part, {
            create: true,
          });
        }

        const fileHandle = await directory.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(entry.blob);
        await writable.close();
      }

      setProgress(`Extracted to ${destination.name}/${extractedFolderName}.`);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save the extracted folder.",
      );
    } finally {
      setIsSavingFolder(false);
    }
  };

  const extractedFileCount = extractedFiles.filter(
    ({ blob }) => blob !== null,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Your files stay on your device
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            ZIP creation and extraction happen locally in your browser. Files
            are never uploaded.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Archive className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Create a ZIP</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Combine files and folders into one archive.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <input
              ref={filesInputRef}
              type="file"
              multiple
              className="sr-only"
              aria-label="Choose files to add to a ZIP"
              onChange={(event) => {
                addFiles(event.currentTarget.files, false);
                event.currentTarget.value = "";
              }}
            />
            <input
              ref={(element) => {
                folderInputRef.current = element;
                element?.setAttribute("webkitdirectory", "");
                element?.setAttribute("multiple", "");
              }}
              type="file"
              className="sr-only"
              aria-label="Choose a folder to add to a ZIP"
              onChange={(event) => {
                addFiles(event.currentTarget.files, true);
                event.currentTarget.value = "";
              }}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => filesInputRef.current?.click()}
                disabled={isCreating || isExtracting}
              >
                <FilePlus2 className="h-4 w-4" />
                Add files
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => folderInputRef.current?.click()}
                disabled={isCreating || isExtracting}
              >
                <FolderPlus className="h-4 w-4" />
                Add folder
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
              {files.length ? (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {files.map(({ file, path }) => (
                    <div
                      key={path}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate text-zinc-700 dark:text-zinc-300">
                        {path}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-24 flex-col items-center justify-center text-center">
                  <FolderOpen className="mb-2 h-6 w-6 text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    No files selected
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Add up to {MAX_FILES} files, with a 100 MB total limit.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={buttonClass}
                onClick={createArchive}
                disabled={
                  !files.length ||
                  isCreating ||
                  isExtracting
                }
              >
                {isCreating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : "Create & download ZIP"}
              </button>
              {files.length > 0 && (
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 px-2 text-sm font-medium text-zinc-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
                  onClick={clearFiles}
                  disabled={isCreating || isExtracting}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
            {isCreating && (
              <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
                {progress}
              </p>
            )}
            {archive && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    ZIP created
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    {archiveName} · {formatBytes(archive.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
                  onClick={() => downloadBlob(archive, archiveName)}
                >
                  <Download className="h-4 w-4" />
                  Download again
                </button>
              </div>
            )}
          </div>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <FileArchive className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Extract a ZIP</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Extract all files and folders with their original structure.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="sr-only"
              aria-label="Choose a ZIP file to extract"
              onChange={(event) => {
                handleZipUpload(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              className={`${secondaryButtonClass} w-full border-dashed py-7`}
              onClick={() => zipInputRef.current?.click()}
              disabled={isCreating || isExtracting || isSavingFolder}
            >
              {isExtracting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <FileArchive className="h-5 w-5" />
              )}
              {isExtracting ? "Extracting ZIP..." : "Choose a ZIP file"}
            </button>

            {(isExtracting || isSavingFolder) && (
              <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
                {progress}
              </p>
            )}

            {extractedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Extracted folder</h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {extractedFileCount}{" "}
                    {extractedFileCount === 1 ? "file" : "files"}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
                  <details open>
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">
                      <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="truncate">{extractedFolderName}</span>
                    </summary>
                    <div className="ml-3 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                      <FolderTree folder={createFolderTree(extractedFiles)} />
                    </div>
                  </details>
                </div>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={extractToFolder}
                  disabled={isSavingFolder || isExtracting || isCreating}
                >
                  {isSavingFolder ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <FolderOpen className="h-4 w-4" />
                  )}
                  {isSavingFolder ? "Extracting folder..." : "Extract to folder"}
                </button>
              </div>
            )}
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              ZIP files are limited to 50 MB, 500 files, and 250 MB of extracted
              content. Extract to create one folder with the same name and
              structure as the ZIP.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
