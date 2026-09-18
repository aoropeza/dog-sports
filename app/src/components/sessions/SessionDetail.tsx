"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus, Trash2, X, Wrench, ClipboardList, CheckCircle2 } from "lucide-react";
import { useServerAction } from "@/hooks/useServerAction";
import { deleteSession, getSession, removeExerciseFromSession, setExerciseDone } from "@/lib/actions/sessions";
import { findExercise, formatSessionDate } from "@/lib/exercises";
import { getPillarAccent } from "@/lib/colors";
import { PILLAR_ICONS } from "@/lib/pillarIcons";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "./PageHeader";

export function SessionDetail({ id }: { id: string }) {
  const router = useRouter();
  const toggleSelectMode = useAppStore((s) => s.toggleSelectMode);
  const selectMode = useAppStore((s) => s.selectMode);

  const [refresh, setRefresh] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Checkbox taps apply instantly; the server value takes over after refetch.
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>({});
  const { data: session, loading, error } = useServerAction(getSession, [id], false, [refresh]);

  if (loading && !session) {
    return (
      <div className="min-h-dvh bg-[var(--bg)]">
        <PageHeader title="Sesión" backHref="/sesiones" />
        <p className="py-16 text-center text-[14px] text-[var(--fg-muted)]">Cargando…</p>
      </div>
    );
  }

  if (error != null || !session) {
    return (
      <div className="min-h-dvh bg-[var(--bg)]">
        <PageHeader title="Sesión" backHref="/sesiones" />
        <p className="py-16 text-center text-[14px] text-[var(--fg-muted)]">
          {error != null ? "No se pudo cargar la sesión." : "Esta sesión no existe."}
        </p>
      </div>
    );
  }

  const isDone = (exId: string) => optimisticDone[exId] ?? session.completedIds.includes(exId);

  const items = session.exerciseIds.flatMap((exId) => {
    const ref = findExercise(exId);
    return ref ? [ref] : [];
  });
  const doneCount = items.filter((r) => isDone(r.exercise.id)).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  // Keep pillars in the order their first exercise was added.
  const groups = items.reduce<{ pillar: (typeof items)[number]["pillar"]; exercises: typeof items }[]>((acc, ref) => {
    const group = acc.find((g) => g.pillar.id === ref.pillar.id);
    if (group) group.exercises.push(ref);
    else acc.push({ pillar: ref.pillar, exercises: [ref] });
    return acc;
  }, []);

  const toggleDone = async (exId: string) => {
    const next = !isDone(exId);
    setOptimisticDone((o) => ({ ...o, [exId]: next }));
    try {
      await setExerciseDone(id, exId, next);
    } finally {
      setRefresh((n) => n + 1);
      setOptimisticDone((o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== exId)));
    }
  };

  const remove = async (exId: string) => {
    await removeExerciseFromSession(id, exId);
    setRefresh((n) => n + 1);
  };

  const removeSession = async () => {
    if (!window.confirm(`¿Eliminar "${session.name}"?`)) return;
    await deleteSession(id);
    router.push("/sesiones");
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <PageHeader title={session.name} subtitle={formatSessionDate(session.date)} backHref="/sesiones" />

      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-5 px-4 py-4 pb-28">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--panel-2)]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[14px] font-semibold tabular-nums text-[var(--fg)]">
            {doneCount}/{items.length}
          </span>
        </div>

        {items.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[var(--fg-muted)]">Esta sesión no tiene ejercicios.</p>
        )}

        {groups.map(({ pillar, exercises }) => {
          const accent = getPillarAccent(pillar.id);
          const Icon = PILLAR_ICONS[pillar.id];
          return (
            <section key={pillar.id}>
              <h2 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold uppercase tracking-wide" style={{ color: accent.hex }}>
                {Icon && <Icon size={14} />} {pillar.name}
              </h2>
              <div className="flex flex-col gap-2">
                {exercises.map(({ exercise }) => {
                  const done = isDone(exercise.id);
                  const open = expanded === exercise.id;
                  return (
                    <div
                      key={exercise.id}
                      className="overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)]"
                      style={{ borderLeftColor: accent.hex, borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center gap-1 pr-1">
                        <button
                          onClick={() => toggleDone(exercise.id)}
                          aria-label={done ? "Marcar pendiente" : "Marcar hecho"}
                          className="flex h-14 w-14 shrink-0 items-center justify-center"
                        >
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors"
                            style={{
                              borderColor: done ? accent.hex : "var(--fg-muted)",
                              background: done ? accent.hex : "transparent",
                            }}
                          >
                            {done && <Check size={14} strokeWidth={3} className="text-white" />}
                          </span>
                        </button>
                        <button
                          onClick={() => setExpanded(open ? null : exercise.id)}
                          aria-expanded={open}
                          className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left"
                        >
                          <span className={`min-w-0 flex-1 text-[15px] leading-snug ${done ? "text-[var(--fg-muted)] line-through" : "text-[var(--fg)]"}`}>
                            {exercise.title}
                          </span>
                          <ChevronDown size={16} className={`shrink-0 text-[var(--fg-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        <button
                          onClick={() => remove(exercise.id)}
                          aria-label={`Quitar ${exercise.title}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--fg-muted)] active:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-3 border-t border-[var(--panel-border)] px-4 py-3">
                              <Detail icon={Wrench} label="Implemento" value={exercise.implemento} />
                              <Detail icon={ClipboardList} label="Descripción" value={exercise.descripcion} />
                              <Detail icon={CheckCircle2} label="Criterio de dominio" value={exercise.criterio} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <button
          onClick={removeSession}
          className="mx-auto mt-2 flex h-10 items-center gap-2 rounded-xl px-4 text-[13.5px] text-[var(--fg-muted)] active:text-red-400"
        >
          <Trash2 size={14} /> Eliminar sesión
        </button>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--panel-border)] bg-[var(--panel)]/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Link
          href="/"
          onClick={() => !selectMode && toggleSelectMode()}
          className="mx-auto flex h-12 w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-[15px] font-semibold text-black"
        >
          <Plus size={17} /> Añadir más ejercicios
        </Link>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
        <Icon size={12} /> {label}
      </p>
      <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--fg-subtle)]">{value}</p>
    </div>
  );
}
