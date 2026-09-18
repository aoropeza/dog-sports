"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, CalendarDays, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useServerAction } from "@/hooks/useServerAction";
import { addExercisesToSession, createSession, listSessions } from "@/lib/actions/sessions";
import { formatSessionDate, todayISO } from "@/lib/exercises";

/** Bottom bar + sheet shown while exercises are selected on the board. */
export function SessionPicker() {
  const router = useRouter();
  const draftIds = useAppStore((s) => s.draftIds);
  const clearDraft = useAppStore((s) => s.clearDraft);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISO);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const { data: sessions, loading, error } = useServerAction(listSessions, [], !open);
  const count = draftIds.size;

  const finish = async (save: () => Promise<string>) => {
    setSaving(true);
    setFailed(false);
    try {
      const id = await save();
      clearDraft();
      setOpen(false);
      router.push(`/sesiones/${id}`);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const ids = () => [...draftIds];
  const createNew = () =>
    finish(async () => {
      const session = await createSession({ name: name || `Entrenamiento ${formatSessionDate(date)}`, date, exerciseIds: ids() });
      return session.id;
    });
  const addToExisting = (id: string) =>
    finish(async () => {
      await addExercisesToSession(id, ids());
      return id;
    });

  return (
    <>
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-2 pl-4 shadow-2xl"
          >
            <span className="flex-1 text-[14px] font-medium text-[var(--fg)]">
              {count} {count === 1 ? "ejercicio" : "ejercicios"}
            </span>
            <button onClick={clearDraft} className="h-10 rounded-xl px-3 text-[13.5px] text-[var(--fg-muted)]">
              Cancelar
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-[14px] font-semibold text-black"
            >
              <Plus size={15} /> Sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !saving && setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative flex max-h-[85dvh] w-full max-w-[480px] flex-col rounded-t-3xl border border-b-0 border-[var(--panel-border)] bg-[var(--panel)] pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <h2 className="text-[17px] font-semibold text-[var(--fg)]">
                  Guardar {count} {count === 1 ? "ejercicio" : "ejercicios"}
                </h2>
                <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-muted)]">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Nueva sesión</p>
                <div className="flex flex-col gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-2)] p-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre (opcional)"
                    className="h-11 rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-[15px] text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-[15px] text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={createNew}
                    disabled={saving || !date}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-black disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    Crear sesión
                  </button>
                </div>

                <p className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                  O añadir a una existente
                </p>
                {loading && !sessions && <p className="py-3 text-[13.5px] text-[var(--fg-muted)]">Cargando…</p>}
                {sessions?.length === 0 && <p className="py-3 text-[13.5px] text-[var(--fg-muted)]">Aún no tienes sesiones.</p>}
                <div className="flex flex-col gap-2">
                  {sessions?.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addToExisting(s.id)}
                      disabled={saving}
                      className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-2)] px-3 py-3 text-left disabled:opacity-60"
                    >
                      <CalendarDays size={16} className="shrink-0 text-[var(--accent)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium text-[var(--fg)]">{s.name}</span>
                        <span className="text-[12.5px] text-[var(--fg-muted)]">
                          {formatSessionDate(s.date)} · {s.exerciseIds.length} ejercicios
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {(failed || error != null) && (
                  <p className="mt-3 text-[13px] text-red-400">No se pudo conectar con la base de datos. Intenta de nuevo.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
