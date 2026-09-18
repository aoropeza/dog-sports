"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Exercise } from "@/types/knowledge";
import { LEVEL_ACCENTS } from "@/lib/colors";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function ExerciseCard({
  exercise,
  accentHex,
  showLevel = true,
}: {
  exercise: Exercise;
  accentHex: string;
  showLevel?: boolean;
}) {
  const selectedId = useAppStore((s) => s.selectedExerciseId);
  const selectExercise = useAppStore((s) => s.selectExercise);
  const level = LEVEL_ACCENTS[exercise.level];
  const selectMode = useAppStore((s) => s.selectMode);
  const drafted = useAppStore((s) => s.draftIds.has(exercise.id));
  const toggleDraft = useAppStore((s) => s.toggleDraft);
  const isSelected = selectedId === exercise.id || drafted;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      onClick={() => (selectMode ? toggleDraft(exercise.id) : selectExercise(exercise.id))}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border px-3 py-2.5 text-left",
        "bg-[var(--panel-2)] border-[var(--panel-border)]",
        isSelected && "ring-2",
      )}
      style={{
        borderLeftColor: accentHex,
        borderLeftWidth: 3,
        boxShadow: isSelected ? `0 0 0 1px ${accentHex}, 0 8px 20px -8px ${accentHex}88` : "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--fg-muted)]">
          {selectMode && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded border"
              style={{
                borderColor: drafted ? accentHex : "var(--fg-muted)",
                background: drafted ? accentHex : "transparent",
              }}
            >
              {drafted && <Check size={11} strokeWidth={3} className="text-white" />}
            </span>
          )}
          #{String(exercise.order).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            !showLevel && "invisible",
          )}
          style={{ background: level.soft, color: level.hex }}
        >
          {exercise.level}
        </span>
      </div>
      <p className="text-[14px] font-medium leading-snug text-[var(--fg)]">{exercise.title}</p>
      {exercise.implemento && (
        <p className="line-clamp-2 text-[12.5px] leading-snug text-[var(--fg-subtle)]">{exercise.implemento}</p>
      )}
    </motion.button>
  );
}
