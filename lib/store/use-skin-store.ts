import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SkinRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";

interface SkinState {
  records: SkinRecord[];
  add: (r: Omit<SkinRecord, "id">) => void;
  update: (id: string, patch: Partial<SkinRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useSkinStore = create<SkinState>()(
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
    { name: "upgrade-alone-skin", version: 1 }
  )
);