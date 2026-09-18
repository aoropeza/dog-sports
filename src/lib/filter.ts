import type { Exercise, Level, Pillar } from "@/types/knowledge";

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function exerciseMatches(ex: Exercise, q: string) {
  if (!q) return true;
  return (
    normalize(ex.title).includes(q) ||
    normalize(ex.implemento).includes(q) ||
    normalize(ex.descripcion).includes(q) ||
    normalize(ex.criterio).includes(q)
  );
}

export function pillarMatches(pillar: Pillar, q: string) {
  return !q || normalize(pillar.name).includes(q) || normalize(pillar.tagline).includes(q);
}

export function visibleExercises(pillar: Pillar, q: string, activeLevels: Set<Level>) {
  return pillar.exercises.filter((ex) => activeLevels.has(ex.level) && exerciseMatches(ex, q));
}
