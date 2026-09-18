"use client";

import { useEffect } from "react";
import knowledgeData from "@/data/knowledge.json";
import type { Knowledge } from "@/types/knowledge";
import { Toolbar, FilterBar } from "@/components/Toolbar";
import { BoardView } from "@/components/BoardView";
import { DetailPanel } from "@/components/DetailPanel";
import { useAppStore } from "@/store/useAppStore";

const knowledge = knowledgeData as unknown as Knowledge;

export default function Home() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const selectExercise = useAppStore((s) => s.selectExercise);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectExercise(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectExercise]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--bg)]">
      <Toolbar knowledge={knowledge} />
      <FilterBar knowledge={knowledge} />
      <div className="relative flex-1 overflow-hidden">
        <BoardView knowledge={knowledge} />
        <DetailPanel knowledge={knowledge} />
      </div>
    </div>
  );
}
