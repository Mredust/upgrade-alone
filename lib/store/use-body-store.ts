import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BodyMeasure } from "@/lib/types";
import { genId } from "@/lib/utils/id";

interface BodyState {
  measures: BodyMeasure[];
  add: (m: Omit<BodyMeasure, "id">) => void;
  update: (id: string, patch: Partial<BodyMeasure>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set) => ({
      measures: [],
      add: (m) => set((s) => ({ measures: [{ ...m, id: genId() }, ...s.measures] })),
      update: (id, patch) =>
        set((s) => ({
          measures: s.measures.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      remove: (id) => set((s) => ({ measures: s.measures.filter((r) => r.id !== id) })),
      reset: () => set({ measures: [] }),
    }),
    { name: "upgrade-alone-body", version: 1 }
  )
);