import { create } from "zustand";
import knowledgeData from "@/data/knowledge.json";
import type { Knowledge, Level } from "@/types/knowledge";

export type ThemeMode = "dark" | "light";

const knowledge = knowledgeData as unknown as Knowledge;
const ALL_LEVELS: Level[] = ["Básico", "Intermedio", "Avanzado"];
const ALL_PILLAR_IDS = knowledge.pillars.map((p) => p.id);

interface AppState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  selectedExerciseId: string | null;
  selectExercise: (id: string | null) => void;

  /** Multi-select mode used to pick exercises for a training session. */
  selectMode: boolean;
  toggleSelectMode: () => void;
  draftIds: Set<string>;
  toggleDraft: (id: string) => void;
  clearDraft: () => void;

  search: string;
  setSearch: (q: string) => void;

  activeLevels: Set<Level>;
  toggleLevel: (l: Level) => void;
  selectAllLevels: () => void;

  activePillars: Set<string>;
  togglePillar: (id: string) => void;
  selectAllPillars: () => void;
}

/** Toggle one item within a group: if every item is currently active ("todos"), clicking
 *  one isolates it; otherwise it's a normal add/remove, falling back to "todos" if that
 *  would empty the selection. */
function toggleInGroup<T>(active: Set<T>, allValues: T[], value: T): Set<T> {
  if (active.size === allValues.length) {
    return new Set([value]);
  }
  const next = new Set(active);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next.size ? next : new Set(allValues);
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),

  selectedExerciseId: null,
  selectExercise: (id) => set({ selectedExerciseId: id }),

  selectMode: false,
  toggleSelectMode: () => set((state) => ({ selectMode: !state.selectMode, draftIds: new Set() })),
  draftIds: new Set(),
  toggleDraft: (id) =>
    set((state) => {
      const next = new Set(state.draftIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { draftIds: next };
    }),
  clearDraft: () => set({ draftIds: new Set(), selectMode: false }),

  search: "",
  setSearch: (search) => set({ search }),

  activeLevels: new Set(ALL_LEVELS),
  toggleLevel: (l) => set((state) => ({ activeLevels: toggleInGroup(state.activeLevels, ALL_LEVELS, l) })),
  selectAllLevels: () => set({ activeLevels: new Set(ALL_LEVELS) }),

  activePillars: new Set(ALL_PILLAR_IDS),
  togglePillar: (id) => set((state) => ({ activePillars: toggleInGroup(state.activePillars, ALL_PILLAR_IDS, id) })),
  selectAllPillars: () => set({ activePillars: new Set(ALL_PILLAR_IDS) }),
}));
