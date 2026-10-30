import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CustomColumn } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  deleteTrainingColumnRecord,
  saveTrainingColumnRecord,
} from "@/lib/actions/records";

interface TrainingColumnState {
  columns: CustomColumn[];
  add: (label: string) => void;
  remove: (id: string) => void;
  setColumns: (columns: CustomColumn[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useTrainingColumnStore = create<TrainingColumnState>()(
  persist(
    (set, get) => ({
      columns: [],
      add: (label) => {
        const column: CustomColumn = { id: genId(), key: `custom-${genId()}`, label };
        set((s) => ({ columns: [...s.columns, column] }));
        saveTrainingColumnRecord(column).catch(syncError);
      },
      remove: (id) => {
        const prev = get().columns;
        set((s) => ({ columns: s.columns.filter((c) => c.id !== id) }));
        deleteTrainingColumnRecord(id).catch(() => {
          set({ columns: prev });
          syncError();
        });
      },
      setColumns: (columns) => set({ columns }),
    }),
    { name: "upgrade-alone-training-columns", version: 1 }
  )
);