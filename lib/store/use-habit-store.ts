import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { HabitRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearHabitRecordsRecords,
  deleteHabitRecordRecord,
  saveHabitRecordRecord,
} from "@/lib/actions/records";

interface HabitState {
  records: HabitRecord[];
  save: (date: string, a: number, b: number) => void;
  remove: (id: string) => void;
  reset: () => void;
  setRecords: (records: HabitRecord[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      records: [],
      save: (date, a, b) => {
        const existing = get().records.find((r) => r.date === date);
        if (existing) {
          const merged: HabitRecord = { ...existing, a, b };
          set((s) => ({ records: s.records.map((r) => (r.id === existing.id ? merged : r)) }));
          saveHabitRecordRecord(merged).catch(() => {
            set((s) => ({ records: s.records.map((r) => (r.id === existing.id ? existing : r)) }));
            syncError();
          });
        } else {
          const record: HabitRecord = { id: genId(), date, a, b };
          set((s) => ({ records: [record, ...s.records] }));
          saveHabitRecordRecord(record).catch(() => {
            set((s) => ({ records: s.records.filter((r) => r.id !== record.id) }));
            syncError();
          });
        }
      },
      remove: (id) => {
        const prevList = get().records;
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        deleteHabitRecordRecord(id).catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().records;
        set({ records: [] });
        clearHabitRecordsRecords().catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      setRecords: (records) => set({ records }),
    }),
    { name: "upgrade-alone-habit", version: 2 }
  )
);