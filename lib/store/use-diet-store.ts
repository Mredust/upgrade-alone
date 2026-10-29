import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DietRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";

interface DietState {
  records: DietRecord[];
  add: (r: Omit<DietRecord, "id">) => void;
  update: (id: string, patch: Partial<DietRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useDietStore = create<DietState>()(
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
    { name: "upgrade-alone-diet", version: 1 }
  )
);