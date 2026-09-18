"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronUp, ChevronDown, Wrench, ClipboardList, CheckCircle2, Eye } from "lucide-react";
import type { Knowledge } from "@/types/knowledge";
import { useAppStore } from "@/store/useAppStore";
import { getPillarAccent, LEVEL_ACCENTS } from "@/lib/colors";
import { PILLAR_ICONS } from "@/lib/pillarIcons";
import { hasMultipleLevels } from "@/lib/filter";

function Field({ icon: Icon, label, value, accent }: { icon: typeof Wrench; label: string; value: string; accent: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: `${accent}1a`, color: accent }}>
        <Icon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{label}</p>
        <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--fg)]">{value}</p>
      </div>
    </div>
  );
}

export function DetailPanel({ knowledge }: { knowledge: Knowledge }) {
  const selectedId = useAppStore((s) => s.selectedExerciseId);
  const selectExercise = useAppStore((s) => s.selectExercise);

  const match = selectedId
    ? knowledge.pillars
        .flatMap((p) => p.exercises.map((e) => ({ exercise: e, pillar: p })))
        .find((x) => x.exercise.id === selectedId)
    : undefined;

  const siblings = match ? match.pillar.exercises : [];
  const idx = match ? siblings.findIndex((e) => e.id === match.exercise.id) : -1;
  const goTo = (offset: number) => {
    if (!match) return;
    const next = siblings[idx + offset];
    if (next) selectExercise(next.id);
  };

  return (
    <AnimatePresence>
      {match && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => selectExercise(null)}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative z-40 flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] shadow-2xl"
          >
            {(() => {
              const accent = getPillarAccent(match.pillar.id);
              const level = LEVEL_ACCENTS[match.exercise.level];
              const Icon = PILLAR_ICONS[match.pillar.id];
              return (
                <>
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-border)] px-4 py-3">
                    <div className="flex items-center gap-2 text-[13px] text-[var(--fg-muted)]">
                      {Icon && <Icon size={13} style={{ color: accent.hex }} />}
                      <span style={{ color: accent.hex }} className="font-medium">
                        {match.pillar.name}
                      </span>
                      <span>/</span>
                      <span>
                        {idx + 1} de {siblings.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goTo(-1)}
                        disabled={idx <= 0}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--panel-2)] disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => goTo(1)}
                        disabled={idx >= siblings.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--panel-2)] disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => selectExercise(null)}
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--panel-2)]"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-[12.5px] text-[var(--fg-muted)]">#{String(match.exercise.order).padStart(2, "0")}</span>
                      {hasMultipleLevels(match.pillar) && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide"
                          style={{ background: level.soft, color: level.hex }}
                        >
                          {match.exercise.level}
                        </span>
                      )}
                    </div>
                    <h2 className="text-[18px] font-semibold leading-snug text-[var(--fg)]">{match.exercise.title}</h2>

                    <div className="mt-5 flex flex-col gap-4">
                      <Field icon={Wrench} label="Implemento" value={match.exercise.implemento} accent={accent.hex} />
                      <Field icon={ClipboardList} label="Descripción" value={match.exercise.descripcion} accent={accent.hex} />
                      <Field icon={CheckCircle2} label="Criterio de dominio" value={match.exercise.criterio} accent={accent.hex} />
                    </div>

                    <div className="mt-6 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-2)] p-3.5">
                      <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                        <Eye size={12} /> Sobre el pilar {match.pillar.name}
                      </p>
                      <p className="text-[13px] leading-relaxed text-[var(--fg-subtle)]">{match.pillar.description}</p>
                      {match.pillar.observe && (
                        <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-subtle)]">
                          <span className="font-medium text-[var(--fg)]">Qué observar: </span>
                          {match.pillar.observe}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
