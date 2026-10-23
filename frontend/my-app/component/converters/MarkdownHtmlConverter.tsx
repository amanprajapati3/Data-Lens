"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

type ConversionMode = "md-to-html" | "html-to-md";
type OutputView = "code" | "preview";

const MARKDOWN_SAMPLE = `# Getting started

**Data Lens** converts your content between Markdown and HTML.

## Features

- Markdown to HTML
- HTML to Markdown
- Copy or download the result

> Everything runs locally in your browser.

| Tool | Purpose |
| --- | --- |
| OCR | Read text from images |
| PDF Compressor | Reduce PDF file size |

Learn more at [Data Lens](https://example.com).
`;

const HTML_SAMPLE = `<article>
  <p><strong>PRODUCT OVERVIEW</strong></p>
  <h1>Smart Data Lens</h1>
  <p>Extract clean data from any page.</p>
  <h2>Features</h2>
  <ul>
    <li>Fast processing</li>
    <li>Accurate results</li>
  </ul>
  <blockquote>Everything runs locally.</blockquote>
  <p><strong>Email:</strong> <a href="mailto:hello@datalens.app">hello@datalens.app</a></p>
</article>
`;

const SAMPLES: Record<ConversionMode, string> = {
  "md-to-html": MARKDOWN_SAMPLE,
  "html-to-md": HTML_SAMPLE,
};

const cardClass =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
const primaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-950";
const secondaryButtonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-emerald-400 dark:focus:ring-offset-zinc-950";
const panelClass =
  "flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800";
const panelHeaderClass =
  "flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60";
const textareaClass =
  "min-h-[22rem] w-full resize-y bg-white p-4 font-mono text-sm leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600";

export default function MarkdownHtmlConverter() {
  const [mode, setMode] = useState<ConversionMode>("md-to-html");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputView, setOutputView] = useState<OutputView>("code");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);

    return () => window.clearTimeout(timer);
  }, [copied]);

  const isMarkdownToHtml = mode === "md-to-html";
  const inputLabel = isMarkdownToHtml ? "Markdown" : "HTML";
  const outputLabel = isMarkdownToHtml ? "HTML" : "Markdown";
  const inputPlaceholder = isMarkdownToHtml
    ? "Paste your Markdown here..."
    : "Paste your HTML here...";

  const wordCount = useMemo(
    () => output.split(/\s+/).filter(Boolean).length,
    [output],
  );

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
    setOutputView("code");
  };

  const loadSample = () => {
    setInput(SAMPLES[mode]);
    setOutput("");
    setError(null);
    setCopied(false);
    setOutputView("code");
  };

  const changeMode = (nextMode: ConversionMode) => {
    if (nextMode === mode) return;

    setMode(nextMode);
    setOutput("");
    setError(null);
    setCopied(false);
    setOutputView("code");

    if (!input.trim()) {
      setInput(SAMPLES[nextMode]);
    }
  };

  const convert = async () => {
    if (!input.trim()) {
      setError(`Add some ${inputLabel} to convert.`);
      setOutput("");
      return;
    }

    setIsConverting(true);
    setError(null);
    setCopied(false);
    setOutputView("code");

    try {
      if (mode === "md-to-html") {
        const { marked } = await import("marked");
        const html = marked.parse(input, {
          gfm: true,
          breaks: true,
        }) as string;

        setOutput(html);
      } else {
        const [{ default: TurndownService }, { gfm }] = await Promise.all([
          import("turndown"),
          import("turndown-plugin-gfm"),
        ]);
        const service = new TurndownService({
          headingStyle: "atx",
          hr: "---",
          bulletListMarker: "-",
          codeBlockStyle: "fenced",
          emDelimiter: "*",
          strongDelimiter: "**",
          linkStyle: "inlined",
        });

        service.use(gfm);
        setOutput(service.turndown(input));
      }
    } catch (caught) {
      setOutput("");
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not convert this content.",
      );
    } finally {
      setIsConverting(false);
    }
  };

  const swap = () => {
    if (!output) return;

    setInput(output);
    setMode(isMarkdownToHtml ? "html-to-md" : "md-to-html");
    setOutput("");
    setError(null);
    setCopied(false);
    setOutputView("code");
  };

  const copyResult = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError(
        "Could not copy automatically. Select the output and copy it manually.",
      );
    }
  };

  const downloadResult = () => {
    if (!output) return;

    const extension = isMarkdownToHtml ? "html" : "md";
    const mimeType = isMarkdownToHtml
      ? "text/html;charset=utf-8"
      : "text/markdown;charset=utf-8";
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `datalens-converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const outputPanel = (
    <div className={panelClass}>
      <div className={panelHeaderClass}>
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{outputLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isMarkdownToHtml && output && (
            <div
              role="tablist"
              aria-label="Output view"
              className="flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
            >
              {(["code", "preview"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={outputView === option}
                  onClick={() => setOutputView(option)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize transition ${
                    outputView === option
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
                  }`}
                >
                  {option === "code" ? (
                    <Code2 className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {option}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={copyResult}
            disabled={!output}
            className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={downloadResult}
            disabled={!output}
            className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {output ? (
        isMarkdownToHtml && outputView === "preview" ? (
          <iframe
            title="Converted HTML preview"
            srcDoc={output}
            sandbox=""
            className="h-[22rem] w-full bg-white"
          />
        ) : (
          <pre className={`${textareaClass} overflow-auto whitespace-pre-wrap break-words`}>
            {output}
          </pre>
        )
      ) : (
        <div className="flex min-h-[22rem] flex-col items-center justify-center gap-2 px-4 text-center">
          <FileCode2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Your {outputLabel} will appear here
          </p>
          <p className="text-xs text-zinc-500">
            Paste {inputLabel} and press Convert.
          </p>
        </div>
      )}

      {output && (
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span>{output.length.toLocaleString()} characters</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Convert in both directions
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Markdown and HTML are converted locally in your browser. Nothing is
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div
            role="tablist"
            aria-label="Conversion direction"
            className="flex flex-wrap gap-2"
          >
            {(
              [
                { value: "md-to-html", label: "Markdown → HTML" },
                { value: "html-to-md", label: "HTML → Markdown" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => changeMode(value)}
                className={`min-h-9 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  mode === value
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-200 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadSample}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium text-zinc-500 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            <WandSparkles className="h-4 w-4" />
            Load sample
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <div className={panelClass}>
            <div className={panelHeaderClass}>
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <label
                  htmlFor="conversion-input"
                  className="text-sm font-semibold"
                >
                  {inputLabel}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {input.length.toLocaleString()} characters
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!input && !output}
                  className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-zinc-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="conversion-input"
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void convert();
                }
              }}
              placeholder={inputPlaceholder}
              spellCheck={false}
              className={textareaClass}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={convert}
                  disabled={isConverting || !input.trim()}
                  className={primaryButtonClass}
                >
                  {isConverting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {isConverting ? "Converting..." : "Convert"}
                </button>
                <button
                  type="button"
                  onClick={swap}
                  disabled={!output || isConverting}
                  className={secondaryButtonClass}
                  title="Use the result as the new input and switch direction"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Swap
                </button>
              </div>

              <span className="px-1 text-xs text-zinc-500 dark:text-zinc-400">
                Ctrl + Enter
              </span>
            </div>
          </div>

          {outputPanel}
        </div>
      </section>
    </div>
  );
}
