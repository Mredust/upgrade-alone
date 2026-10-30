import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SkinProduct } from "@/lib/types";
import { genId } from "@/lib/utils/id";
import { toast } from "@/lib/store/use-toast-store";
import {
  clearSkinProductsRecords,
  deleteSkinProductRecord,
  saveSkinProductRecord,
} from "@/lib/actions/records";

interface SkinProductState {
  products: SkinProduct[];
  add: (r: Omit<SkinProduct, "id">) => void;
  remove: (id: string) => void;
  reset: () => void;
  setProducts: (products: SkinProduct[]) => void;
}

function syncError() {
  toast("云端同步失败，请检查网络后重试", "error");
}

export const useSkinProductStore = create<SkinProductState>()(
  persist(
    (set, get) => ({
      products: [],
      add: (r) => {
        const product: SkinProduct = { ...r, id: genId() };
        set((s) => ({ products: [product, ...s.products] }));
        saveSkinProductRecord(product).catch(syncError);
      },
      remove: (id) => {
        const prevList = get().products;
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        deleteSkinProductRecord(id).catch(() => {
          set({ products: prevList });
          syncError();
        });
      },
      reset: () => {
        const prevList = get().products;
        set({ products: [] });
        clearSkinProductsRecords().catch(() => {
          set({ products: prevList });
          syncError();
        });
      },
      setProducts: (products) => set({ products }),
    }),
    { name: "upgrade-alone-skin-products", version: 1 }
  )
);