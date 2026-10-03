"use client";

import type { ExtractionMode } from "@/types/extractor";

interface ModeSelectorProps {
  mode: ExtractionMode;
  onModeChange: (mode: ExtractionMode) => void;
  disabled?: boolean;
}

const OPTIONS: { value: ExtractionMode; label: string; hint: string }[] = [
  { value: "url", label: "Website URL", hint: "Crawl a live website" },
  { value: "image", label: "Screenshot", hint: "Read an uploaded image" },
];

export default function ModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Extraction mode"
      className="grid grid-cols-1 gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100/80 p-1.5 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => {
        const isActive = mode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onModeChange(option.value)}
            className={[
              "flex w-full flex-col items-start gap-0.5 rounded-lg px-3.5 py-2.5 text-left transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "bg-white shadow-sm ring-1 ring-zinc-900/10 dark:bg-zinc-800 dark:ring-white/10"
                : "hover:bg-white/60 dark:hover:bg-zinc-800/60",
            ].join(" ")}
          >
            <span
              className={[
                "text-sm font-medium",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400",
              ].join(" ")}
            >
              {option.label}
            </span>
            <span
              className={[
                "text-xs",
                isActive
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-500/80 dark:text-zinc-500",
              ].join(" ")}
            >
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
