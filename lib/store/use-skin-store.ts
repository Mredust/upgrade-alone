import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SkinRecord } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearSkinRecords,
  deleteSkinRecord,
  saveSkinRecord,
} from "@/lib/actions/records";

interface SkinState {
  records: SkinRecord[];
  add: (r: Omit<SkinRecord, "id">) => void;
  update: (id: string, patch: Partial<SkinRecord>) => void;
  remove: (id: string) => void;
  reset: () => void;
  setRecords: (records: SkinRecord[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useSkinStore = create<SkinState>()(
  persist(
    (set, get) => ({
      records: [],
      add: (r) => {
        const record: SkinRecord = { ...r, id: genId() };
        set((s) => ({ records: [record, ...s.records] }));
        saveSkinRecord(record).catch(syncError);
      },
      update: (id, patch) => {
        const prev = get().records.find((r) => r.id === id);
        if (!prev) return;
        const merged: SkinRecord = { ...prev, ...patch };
        set((s) => ({ records: s.records.map((r) => (r.id === id ? merged : r)) }));
        saveSkinRecord(merged).catch(() => {
          set((s) => ({ records: s.records.map((r) => (r.id === id ? prev : r)) }));
          syncError();
        });
      },
      remove: (id) => {
        const prevList = get().records;
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
        deleteSkinRecord(id).catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().records;
        set({ records: [] });
        clearSkinRecords().catch(() => {
          set({ records: prevList });
          syncError();
        });
      },
      setRecords: (records) => set({ records }),
    }),
    { name: "upgrade-alone-skin", version: 1 }
  )
);