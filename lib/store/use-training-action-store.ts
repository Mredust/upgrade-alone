import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TrainingActionItem } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearTrainingActionItemsRecords,
  deleteTrainingActionItemRecord,
  saveTrainingActionItemRecord,
} from "@/lib/actions/records";

interface TrainingActionState {
  items: TrainingActionItem[];
  add: (r: Omit<TrainingActionItem, "id">) => void;
  remove: (id: string) => void;
  reset: () => void;
  setItems: (items: TrainingActionItem[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useTrainingActionStore = create<TrainingActionState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (r) => {
        const item: TrainingActionItem = { ...r, id: genId() };
        set((s) => ({ items: [item, ...s.items] }));
        saveTrainingActionItemRecord(item).catch(syncError);
      },
      remove: (id) => {
        const prevList = get().items;
        set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
        deleteTrainingActionItemRecord(id).catch(() => {
          set({ items: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().items;
        set({ items: [] });
        clearTrainingActionItemsRecords().catch(() => {
          set({ items: prevList });
          syncError();
        });
      },
      setItems: (items) => set({ items }),
    }),
    { name: "upgrade-alone-training-actions", version: 1 }
  )
);