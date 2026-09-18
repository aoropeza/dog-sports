"use client";

import { Search, Sun, Moon, PawPrint } from "lucide-react";
import type { Knowledge, Level } from "@/types/knowledge";
import { useAppStore } from "@/store/useAppStore";
import { getPillarAccent, LEVEL_ACCENTS } from "@/lib/colors";

const LEVELS: Level[] = ["Básico", "Intermedio", "Avanzado"];

export function Toolbar({ knowledge }: { knowledge: Knowledge }) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const search = useAppStore((s) => s.search);
  const setSearch = useAppStore((s) => s.setSearch);

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--panel-border)] bg-[var(--panel)]/80 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <PawPrint size={17} strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold leading-tight text-[var(--fg)]">Pilares del entrenamiento canino</h1>
          <p className="text-[12.5px] text-[var(--fg-muted)]">
            {knowledge.stats.pillarCount} pilares · {knowledge.stats.exerciseCount} ejercicios
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio, implemento..."
            className="h-8 w-52 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-2)] pl-7 pr-2.5 text-[13.5px] text-[var(--fg)] placeholder:text-[var(--fg-muted)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-2)] text-[var(--fg-subtle)] hover:text-[var(--fg)]"
          title="Cambiar tema"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  );
}

export function FilterBar({ knowledge }: { knowledge: Knowledge }) {
  const activeLevels = useAppStore((s) => s.activeLevels);
  const toggleLevel = useAppStore((s) => s.toggleLevel);
  const selectAllLevels = useAppStore((s) => s.selectAllLevels);
  const activePillars = useAppStore((s) => s.activePillars);
  const togglePillar = useAppStore((s) => s.togglePillar);
  const selectAllPillars = useAppStore((s) => s.selectAllPillars);

  const allPillarsActive = activePillars.size === knowledge.pillars.length;
  const allLevelsActive = activeLevels.size === LEVELS.length;

  return (
    <div className="flex flex-col border-b border-[var(--panel-border)] bg-[var(--panel)]/60 backdrop-blur-md">
      <div className="flex items-center gap-2.5 border-b border-[var(--panel-border)]/60 px-4 py-2">
        <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Pilares</span>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <button
            onClick={selectAllPillars}
            className="rounded-full border px-2 py-1 text-[12px] font-medium transition-all"
            style={{
              borderColor: allPillarsActive ? "var(--accent)" : "var(--panel-border)",
              background: allPillarsActive ? "var(--accent-soft)" : "transparent",
              color: allPillarsActive ? "var(--accent)" : "var(--fg-subtle)",
            }}
          >
            Todos
          </button>
          {knowledge.pillars.map((p) => {
            const accent = getPillarAccent(p.id);
            const active = activePillars.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePillar(p.id)}
                className="flex items-center gap-1.5 rounded-full border px-2 py-1 text-[12px] font-medium transition-all"
                style={{
                  borderColor: active ? accent.hex : "var(--panel-border)",
                  background: active ? accent.soft : "transparent",
                  color: active ? accent.hex : "var(--fg-subtle)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent.hex }} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Nivel</span>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-2)] p-0.5">
          <button
            onClick={selectAllLevels}
            className="rounded-md px-2 py-1 text-[12px] font-medium transition-colors"
            style={{
              background: allLevelsActive ? "var(--accent-soft)" : "transparent",
              color: allLevelsActive ? "var(--accent)" : "var(--fg-muted)",
            }}
          >
            Todos
          </button>
          {LEVELS.map((lvl) => {
            const active = activeLevels.has(lvl);
            const accent = LEVEL_ACCENTS[lvl];
            return (
              <button
                key={lvl}
                onClick={() => toggleLevel(lvl)}
                className="rounded-md px-2 py-1 text-[12px] font-medium transition-colors"
                style={{
                  background: active ? accent.soft : "transparent",
                  color: active ? accent.hex : "var(--fg-muted)",
                }}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
