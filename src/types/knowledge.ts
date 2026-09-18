export type Level = "Básico" | "Intermedio" | "Avanzado";

export interface Exercise {
  id: string;
  pillarId: string;
  order: number;
  title: string;
  level: Level;
  implemento: string;
  descripcion: string;
  criterio: string;
  fields: Record<string, string>;
}

export interface Pillar {
  id: string;
  name: string;
  color: string;
  tagline: string;
  description: string;
  observe: string;
  generalNotes: string[];
  levelObjectives: Partial<Record<Level, string>>;
  levelCounts: Partial<Record<Level, number>>;
  exerciseCount: number;
  exercises: Exercise[];
}

export interface Knowledge {
  generatedAt: string;
  source: string;
  closingNote: string;
  stats: { pillarCount: number; exerciseCount: number };
  pillars: Pillar[];
}
