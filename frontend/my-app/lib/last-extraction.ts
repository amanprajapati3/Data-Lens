import type { ExtractionMode } from "@/types/extractor";

/*
 * Last extraction, kept in sessionStorage so
 * the converter page can offer it after the
 * user navigates away from Data Extract.
 *
 * The store is exposed through
 * useSyncExternalStore, which keeps the first
 * client render identical to the server HTML
 * (no hydration mismatch) and re-renders
 * subscribers when the value changes.
 */

export interface LastExtraction {
  mode: ExtractionMode;
  data: unknown;
  savedAt: string;
}

const STORAGE_KEY = "datalens:last-extraction";

let cached: LastExtraction | null = null;

let hasRead = false;

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readFromStorage(): LastExtraction | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return parsed as LastExtraction;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Store the newest extraction. Called when a
 * crawl or image extraction succeeds.
 */
export function saveLastExtraction(
  mode: ExtractionMode,
  data: unknown,
): void {
  const value: LastExtraction = {
    mode,
    data,
    savedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(value),
      );
    } catch {
      /*
       * Quota exceeded or storage disabled:
       * the converter simply falls back to
       * the default state.
       */
    }
  }

  cached = value;
  hasRead = true;
  notify();
}

/**
 * Remove the stored extraction, used by the
 * cross button on the converter page.
 */
export function clearLastExtraction(): void {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do.
    }
  }

  cached = null;
  hasRead = true;
  notify();
}

export function subscribeLastExtraction(
  listener: () => void,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getLastExtractionClientSnapshot(): LastExtraction | null {
  if (!hasRead) {
    cached = readFromStorage();
    hasRead = true;
  }

  return cached;
}

export function getLastExtractionServerSnapshot(): LastExtraction | null {
  return null;
}
