"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  Pencil,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { editJsonWithAi } from "@/lib/api";

interface JsonViewerProps {
  data: unknown;
  onSave?: (data: unknown) => void;
}

type ViewerMode = "view" | "edit" | "ai";

const controlButton =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900";

const activeEditButton =
  "inline-flex cursor-default items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-300";

const saveButton =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900";

function formatJson(value: unknown): string {
  try {
    if (value === undefined) {
      return "null";
    }
    return JSON.stringify(value, null, 2);
  } catch {
    return "null";
  }
}

export default function JsonViewer({ data, onSave }: JsonViewerProps) {
  const [current, setCurrent] = useState<unknown>(data);
  const [prevData, setPrevData] = useState<unknown>(data);
  const [mode, setMode] = useState<ViewerMode>("view");
  const [draft, setDraft] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /*
   * Follow a new prop during render instead of
   * in an effect, so a fresh extraction resets
   * the viewer without an extra render pass.
   */
  if (data !== prevData) {
    setPrevData(data);
    setCurrent(data);
  }

  const formattedJson = formatJson(current);

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

  const handleEdit = () => {
    if (mode === "edit") {
      return;
    }

    setDraft(formattedJson);
    setError(null);
    setNotice(null);
    setMode("edit");
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft);

      setError(null);
      setNotice("Changes saved.");
      setCurrent(parsed);
      onSave?.(parsed);
      setMode("view");
    } catch (err) {
      setError(
        err instanceof Error
          ? `Invalid JSON: ${err.message}`
          : "Invalid JSON",
      );
    }
  };

  const handleOpenAi = () => {
    setError(null);
    setNotice(null);
    setInstruction("");
    setMode("ai");
  };

  const handleSendAi = async () => {
    if (loading) {
      return;
    }

    const trimmed = instruction.trim();

    if (!trimmed) {
      setError("Describe the change you want before sending.");
      return;
    }

    /*
     * When the user already edited the text by
     * hand, the AI works on that draft so no
     * unsaved change is lost.
     */
    let source: unknown = current;

    if (mode === "edit") {
      try {
        source = JSON.parse(draft);
      } catch {
        setError("Fix the JSON before sending it to AI.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const edited = await editJsonWithAi(source, trimmed);

      setDraft(formatJson(edited));
      setInstruction("");
      setNotice("AI edit applied. Review the JSON and press Save.");
      setMode("edit");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to edit the JSON with AI",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/60 sm:px-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          JSON
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={controlButton}
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
          <button
            type="button"
            onClick={handleOpenAi}
            disabled={loading}
            className={controlButton}
            title="Edit the JSON with Gemini AI"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Edit with AI
          </button>
          {mode === "edit" ? (
            <span className={activeEditButton} aria-pressed="true">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </span>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading}
              className={controlButton}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleSave}
              className={saveButton}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 sm:px-6 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {notice && !error && (
        <div className="border-b border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 sm:px-6 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-300">
          {notice}
        </div>
      )}

      {mode === "ai" && (
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/60 sm:px-6">
          <label
            htmlFor="ai-edit-instruction"
            className="text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Tell Gemini how to modify the JSON
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <textarea
              id="ai-edit-instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              disabled={loading}
              rows={3}
              placeholder='For example: "Remove every field whose value is null" or "Add a tags array to each page"'
              className="min-h-[4.5rem] flex-1 resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-900"
            />
            <button
              type="button"
              onClick={handleSendAi}
              disabled={loading}
              className={`${saveButton} h-fit shrink-0 px-4 py-2.5 sm:py-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Editing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </div>
          {loading && (
            <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Gemini is editing the JSON, this can take a moment…
            </p>
          )}
        </div>
      )}

      {mode === "edit" ? (
        <div className="p-4 sm:p-6">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            aria-label="Editable JSON content"
            className="max-h-[600px] min-h-[14rem] w-full resize-y rounded-md border border-gray-300 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-zinc-950 dark:text-gray-100"
          />
        </div>
      ) : (
        <div className="max-h-96 overflow-auto p-4 sm:max-h-[600px] sm:p-6">
          <pre className="overflow-x-auto whitespace-pre text-xs font-mono leading-relaxed text-gray-800 sm:text-sm dark:text-gray-100">
            <code className="block">{formattedJson}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
