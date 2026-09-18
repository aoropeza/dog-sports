"use client";

import { motion } from "framer-motion";
import type { Knowledge } from "@/types/knowledge";
import type { Level } from "@/types/knowledge";
import { useAppStore } from "@/store/useAppStore";
import { getPillarAccent, LEVEL_ACCENTS } from "@/lib/colors";
import { PILLAR_ICONS } from "@/lib/pillarIcons";
import { pillarMatches, visibleExercises, normalize, hasMultipleLevels } from "@/lib/filter";
import { ExerciseCard } from "@/components/cards/ExerciseCard";

const LEVELS: Level[] = ["Básico", "Intermedio", "Avanzado"];

export function BoardView({ knowledge }: { knowledge: Knowledge }) {
  const search = useAppStore((s) => s.search);
  const activeLevels = useAppStore((s) => s.activeLevels);
  const activePillars = useAppStore((s) => s.activePillars);

  const q = normalize(search.trim());
  const pillars = knowledge.pillars.filter((p) => activePillars.has(p.id));

  return (
    <div className="flex h-full gap-4 overflow-x-auto overflow-y-hidden px-4 py-4">
      {pillars.map((pillar) => {
        const accent = getPillarAccent(pillar.id);
        const Icon = PILLAR_ICONS[pillar.id];
        const cards = visibleExercises(pillar, q, activeLevels);
        const nameMatches = pillarMatches(pillar, q);
        const hiddenBySearch = q.length > 0 && cards.length === 0 && !nameMatches;
        const showLevels = hasMultipleLevels(pillar);

        if (hiddenBySearch) return null;

        return (
          <motion.div
            layout
            key={pillar.id}
            className="flex h-full w-[292px] shrink-0 flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)]"
          >
            <div
              className="shrink-0 rounded-t-2xl border-b px-3.5 py-3"
              style={{ borderColor: "var(--panel-border)", boxShadow: `inset 0 2px 0 ${accent.hex}` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: accent.soft, color: accent.hex }}
                >
                  {Icon ? <Icon size={16} strokeWidth={2.25} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold text-[var(--fg)]">{pillar.name}</p>
                  <p className="truncate text-[12px] text-[var(--fg-muted)]">
                    {cards.length}
                    {cards.length !== pillar.exerciseCount ? ` / ${pillar.exerciseCount}` : ""} ejercicios
                  </p>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-[var(--fg-subtle)]">{pillar.tagline}</p>
              <div className={`mt-2 flex items-center gap-1.5 ${showLevels ? "" : "invisible"}`}>
                {LEVELS.map((lvl) => {
                  const count = pillar.levelCounts[lvl] ?? 0;
                  return (
                    <span
                      key={lvl}
                      className="rounded-full px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums"
                      style={
                        count
                          ? { background: LEVEL_ACCENTS[lvl].soft, color: LEVEL_ACCENTS[lvl].hex }
                          : { background: "var(--panel-2)", color: "var(--fg-muted)" }
                      }
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-2.5">
              <div className="flex flex-col gap-2">
                {cards.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} accentHex={accent.hex} showLevel={showLevels} />
                ))}
                {cards.length === 0 && (
                  <p className="px-1 py-6 text-center text-[12.5px] text-[var(--fg-muted)]">Sin ejercicios con estos filtros</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
