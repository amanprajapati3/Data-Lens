"use client";

import { useLayoutEffect } from "react";

export default function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const isDark = localStorage.getItem("theme") === "dark";
      document.documentElement.classList.toggle(
        "dark",
        isDark,
      );
    } catch {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return null;
}
