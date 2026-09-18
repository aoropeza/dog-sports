"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/** Restores the saved theme and mirrors store changes onto <html>. Lives in the
 *  root layout so every page shares it. */
export function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return null;
}
