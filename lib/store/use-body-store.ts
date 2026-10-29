import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BodyMeasure } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearBodyRecords,
  deleteBodyRecord,
  saveBodyRecord,
} from "@/lib/actions/records";

interface BodyState {
  measures: BodyMeasure[];
  add: (m: Omit<BodyMeasure, "id">) => void;
  update: (id: string, patch: Partial<BodyMeasure>) => void;
  remove: (id: string) => void;
  reset: () => void;
  setMeasures: (measures: BodyMeasure[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      measures: [],
      add: (m) => {
        const record: BodyMeasure = { ...m, id: genId() };
        set((s) => ({ measures: [record, ...s.measures] }));
        saveBodyRecord(record).catch(syncError);
      },
      update: (id, patch) => {
        const prev = get().measures.find((m) => m.id === id);
        if (!prev) return;
        const merged: BodyMeasure = { ...prev, ...patch };
        set((s) => ({ measures: s.measures.map((m) => (m.id === id ? merged : m)) }));
        saveBodyRecord(merged).catch(() => {
          set((s) => ({ measures: s.measures.map((m) => (m.id === id ? prev : m)) }));
          syncError();
        });
      },
      remove: (id) => {
        const prevList = get().measures;
        set((s) => ({ measures: s.measures.filter((m) => m.id !== id) }));
        deleteBodyRecord(id).catch(() => {
          set({ measures: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().measures;
        set({ measures: [] });
        clearBodyRecords().catch(() => {
          set({ measures: prevList });
          syncError();
        });
      },
      setMeasures: (measures) => set({ measures }),
    }),
    { name: "upgrade-alone-body", version: 1 }
  )
);