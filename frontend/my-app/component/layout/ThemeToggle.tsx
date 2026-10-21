"use client";

import { useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeToTheme,
} from "@/component/shared/themeStore";

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [animKey, setAnimKey] = useState(0);

  const toggleTheme = () => {
    const nextIsDark =
      !document.documentElement.classList.contains("dark");

    setAnimKey((key) => key + 1);
    document.documentElement.classList.toggle("dark", nextIsDark);

    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode) — theme still applies for this session
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
    >
      <span
        key={animKey}
        suppressHydrationWarning
        className={animKey > 0 ? "theme-icon-anim inline-flex" : "inline-flex"}
      >
        {isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
