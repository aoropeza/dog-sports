"use client";

import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function PageHeader({ title, subtitle, backHref }: { title: string; subtitle?: string; backHref: string }) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--panel-border)] bg-[var(--panel)]/85 px-4 py-3 backdrop-blur-md">
      <Link
        href={backHref}
        aria-label="Volver"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--panel-2)] text-[var(--fg-subtle)]"
      >
        <ArrowLeft size={16} />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[16px] font-semibold leading-tight text-[var(--fg)]">{title}</h1>
        {subtitle && <p className="truncate text-[12.5px] text-[var(--fg-muted)]">{subtitle}</p>}
      </div>
      <button
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--panel-2)] text-[var(--fg-subtle)]"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}
