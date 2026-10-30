import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SleepRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearSleepRecords,
  deleteSleepRecord,
  saveSleepRecord,
} from "@/lib/actions/records";

interface SleepState {
  records: SleepRecord[];
  add: (r: Omit<SleepRecord, "id">) => void;
  update: (id: string, patch: Partial<SleepRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
  setRecords: (records: SleepRecord[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      records: [],
      add: (r) => {
        const record: SleepRecord = { ...r, id: genId() };
        set((s) => ({ records: [record, ...s.records] }));
        saveSleepRecord(record).catch(syncError);
      },
      update: (id, patch) => {
        const prev = get().records.find((r) => r.id === id);
        if (!prev) return;
        const merged: SleepRecord = { ...prev, ...patch };
        set((s) => ({ records: s.records.map((r) => (r.id === id ? merged : r)) }));
        saveSleepRecord(merged).catch(() => {
          set((s) => ({ records: s.records.map((r) => (r.id === id ? prev : r)) }));
          syncError();
        });
      },
      remove: (id) => {
        const prevList = get().records;
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        deleteSleepRecord(id).catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().records;
        set({ records: [] });
        clearSleepRecords().catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      setRecords: (records) => set({ records }),
    }),
    { name: "upgrade-alone-sleep", version: 2 }
  )
);