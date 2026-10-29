import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TrainingRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";

interface TrainingState {
  records: TrainingRecord[];
  add: (r: Omit<TrainingRecord, "id">) => void;
  update: (id: string, patch: Partial<TrainingRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set) => ({
      records: [],
      add: (r) => set((s) => ({ records: [{ ...r, id: genId() }, ...s.records] })),
      update: (id, patch) =>
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      remove: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
      reset: () => set({ records: [] }),
    }),
    { name: "upgrade-alone-training", version: 1 }
  )
);