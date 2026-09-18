import knowledgeData from "@/data/knowledge.json";
import type { Exercise, Knowledge, Pillar } from "@/types/knowledge";

const knowledge = knowledgeData as unknown as Knowledge;

export interface ExerciseRef {
  exercise: Exercise;
  pillar: Pillar;
}

const BY_ID = new Map<string, ExerciseRef>(
  knowledge.pillars.flatMap((pillar) => pillar.exercises.map((exercise) => [exercise.id, { exercise, pillar }] as const)),
);

export function findExercise(id: string): ExerciseRef | undefined {
  return BY_ID.get(id);
}

/** `YYYY-MM-DD` for today in the browser's timezone. */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatSessionDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });
}
