import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CustomColumn } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  deleteSkinColumnRecord,
  saveSkinColumnRecord,
} from "@/lib/actions/records";

interface SkinColumnState {
  columns: CustomColumn[];
  add: (label: string) => void;
  remove: (id: string) => void;
  setColumns: (columns: CustomColumn[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useSkinColumnStore = create<SkinColumnState>()(
  persist(
    (set, get) => ({
      columns: [],
      add: (label) => {
        const column: CustomColumn = { id: genId(), key: `custom-${genId()}`, label };
        set((s) => ({ columns: [...s.columns, column] }));
        saveSkinColumnRecord(column).catch(syncError);
      },
      remove: (id) => {
        const prev = get().columns;
        set((s) => ({ columns: s.columns.filter((c) => c.id !== id) }));
        deleteSkinColumnRecord(id).catch(() => {
          set({ columns: prev });
          syncError();
        });
      },
      setColumns: (columns) => set({ columns }),
    }),
    { name: "upgrade-alone-skin-columns", version: 1 }
  )
);