"use client";

import { useState } from "react";
import Link from "next/link";
import { ListChecks, Trash2 } from "lucide-react";
import { useServerAction } from "@/hooks/useServerAction";
import { deleteSession, listSessions } from "@/lib/actions/sessions";
import { formatSessionDate } from "@/lib/exercises";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "./PageHeader";

export function SessionsList() {
  const [refresh, setRefresh] = useState(0);
  const { data: sessions, loading, error } = useServerAction(listSessions, [], false, [refresh]);
  const toggleSelectMode = useAppStore((s) => s.toggleSelectMode);
  const selectMode = useAppStore((s) => s.selectMode);

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    await deleteSession(id);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <PageHeader title="Mis sesiones" subtitle="Entrenamientos planeados" backHref="/" />

      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-4 py-4 pb-28">
        {loading && !sessions && <p className="py-10 text-center text-[14px] text-[var(--fg-muted)]">Cargando…</p>}
        {error != null && (
          <p className="py-10 text-center text-[14px] text-red-400">No se pudieron cargar las sesiones.</p>
        )}
        {sessions?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ListChecks size={28} className="text-[var(--fg-muted)]" />
            <p className="text-[15px] font-medium text-[var(--fg)]">Todavía no hay sesiones</p>
            <p className="max-w-[260px] text-[13.5px] text-[var(--fg-muted)]">
              Elige ejercicios en los pilares y guárdalos en una sesión.
            </p>
          </div>
        )}

        {sessions?.map((s) => {
          const total = s.exerciseIds.length;
          const done = s.completedIds.length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div key={s.id} className="flex items-stretch overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)]">
              <Link href={`/sesiones/${s.id}`} className="flex min-w-0 flex-1 flex-col gap-2 p-4 active:bg-[var(--panel-2)]">
                <div>
                  <p className="truncate text-[16px] font-semibold text-[var(--fg)]">{s.name}</p>
                  <p className="text-[13px] capitalize text-[var(--fg-muted)]">{formatSessionDate(s.date)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--panel-2)]">
                    <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[12.5px] tabular-nums text-[var(--fg-subtle)]">
                    {done}/{total}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => remove(s.id, s.name)}
                aria-label={`Eliminar ${s.name}`}
                className="flex w-12 items-center justify-center border-l border-[var(--panel-border)] text-[var(--fg-muted)] active:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--panel-border)] bg-[var(--panel)]/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Link
          href="/"
          onClick={() => !selectMode && toggleSelectMode()}
          className="mx-auto flex h-12 w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-[15px] font-semibold text-black"
        >
          <ListChecks size={17} /> Elegir ejercicios
        </Link>
      </div>
    </div>
  );
}
