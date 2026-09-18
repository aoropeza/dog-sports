"use client";

import { useEffect } from "react";
import knowledgeData from "@/data/knowledge.json";
import type { Knowledge } from "@/types/knowledge";
import { Toolbar, FilterBar } from "@/components/Toolbar";
import { BoardView } from "@/components/BoardView";
import { DetailPanel } from "@/components/DetailPanel";
import { SessionPicker } from "@/components/sessions/SessionPicker";
import { useAppStore } from "@/store/useAppStore";

const knowledge = knowledgeData as unknown as Knowledge;

export default function Home() {
  const selectExercise = useAppStore((s) => s.selectExercise);

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
        <SessionPicker />
      </div>
    </div>
  );
}
