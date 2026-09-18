import type { Level } from "@/types/knowledge";

export const PILLAR_ACCENTS: Record<string, { hex: string; soft: string; label: string }> = {
  presa: { hex: "#f59e0b", soft: "#f59e0b26", label: "Ámbar" },
  mordida: { hex: "#f43f5e", soft: "#f43f5e26", label: "Rosa" },
  control: { hex: "#8b5cf6", soft: "#8b5cf626", label: "Violeta" },
  seguimiento: { hex: "#0ea5e9", soft: "#0ea5e926", label: "Cielo" },
  propiocepcion: { hex: "#14b8a6", soft: "#14b8a626", label: "Verde azulado" },
  fuerza: { hex: "#fb923c", soft: "#fb923c26", label: "Naranja" },
  pliometria: { hex: "#d946ef", soft: "#d946ef26", label: "Fucsia" },
  resistencia: { hex: "#10b981", soft: "#10b98126", label: "Esmeralda" },
  obstaculos: { hex: "#6366f1", soft: "#6366f126", label: "Índigo" },
};

export const DEFAULT_ACCENT = { hex: "#64748b", soft: "#64748b26", label: "Gris" };

export function getPillarAccent(id: string) {
  return PILLAR_ACCENTS[id] ?? DEFAULT_ACCENT;
}

export const LEVEL_ACCENTS: Record<Level, { hex: string; soft: string }> = {
  Básico: { hex: "#22c55e", soft: "#22c55e26" },
  Intermedio: { hex: "#f59e0b", soft: "#f59e0b26" },
  Avanzado: { hex: "#ef4444", soft: "#ef444426" },
};
