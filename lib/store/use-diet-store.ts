import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DietRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearDietRecords,
  deleteDietRecord,
  saveDietRecord,
} from "@/lib/actions/records";

interface DietState {
  records: DietRecord[];
  add: (r: Omit<DietRecord, "id">) => void;
  update: (id: string, patch: Partial<DietRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
  setRecords: (records: DietRecord[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      records: [],
      add: (r) => {
        const record: DietRecord = { ...r, id: genId() };
        set((s) => ({ records: [record, ...s.records] }));
        saveDietRecord(record).catch(syncError);
      },
      update: (id, patch) => {
        const prev = get().records.find((r) => r.id === id);
        if (!prev) return;
        const merged: DietRecord = { ...prev, ...patch };
        set((s) => ({ records: s.records.map((r) => (r.id === id ? merged : r)) }));
        saveDietRecord(merged).catch(() => {
          set((s) => ({ records: s.records.map((r) => (r.id === id ? prev : r)) }));
          syncError();
        });
      },
      remove: (id) => {
        const prevList = get().records;
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        deleteDietRecord(id).catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().records;
        set({ records: [] });
        clearDietRecords().catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      setRecords: (records) => set({ records }),
    }),
    { name: "upgrade-alone-diet", version: 1 }
  )
);