import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TrainingRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearTrainingRecords,
  deleteTrainingRecord,
  saveTrainingRecord,
} from "@/lib/actions/records";

interface TrainingState {
  records: TrainingRecord[];
  add: (r: Omit<TrainingRecord, "id">) => void;
  update: (id: string, patch: Partial<TrainingRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
  setRecords: (records: TrainingRecord[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      records: [],
      add: (r) => {
        const record: TrainingRecord = { ...r, id: genId() };
        set((s) => ({ records: [record, ...s.records] }));
        saveTrainingRecord(record).catch(syncError);
      },
      update: (id, patch) => {
        const prev = get().records.find((r) => r.id === id);
        if (!prev) return;
        const merged: TrainingRecord = { ...prev, ...patch };
        set((s) => ({ records: s.records.map((r) => (r.id === id ? merged : r)) }));
        saveTrainingRecord(merged).catch(() => {
          set((s) => ({ records: s.records.map((r) => (r.id === id ? prev : r)) }));
          syncError();
        });
      },
      remove: (id) => {
        const prevList = get().records;
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        deleteTrainingRecord(id).catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().records;
        set({ records: [] });
        clearTrainingRecords().catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      setRecords: (records) => set({ records }),
    }),
    { name: "upgrade-alone-training", version: 1 }
  )
);