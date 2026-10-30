export interface SkinStep {
  key: string;
  label: string;
  category: string; // 关联的产品类别 key
}

// 日间护肤步骤（移除眼霜；乳液/面霜拆分）
export const DAY_STEPS: SkinStep[] = [
  { key: "dayCleanser", label: "洁面", category: "cleanser" },
  { key: "dayToner", label: "爽肤水", category: "toner" },
  { key: "daySerum", label: "精华", category: "serum" },
  { key: "dayLotion", label: "乳液", category: "lotion" },
  { key: "dayCream", label: "面霜", category: "cream" },
  { key: "daySunscreen", label: "防晒", category: "sunscreen" },
];

// 夜间护肤步骤（移除卸妆、眼霜、特殊护理；乳液/面霜拆分）
export const NIGHT_STEPS: SkinStep[] = [
  { key: "nightCleanser", label: "洁面", category: "cleanser" },
  { key: "nightToner", label: "爽肤水", category: "toner" },
  { key: "nightSerum", label: "精华", category: "serum" },
  { key: "nightLotion", label: "乳液", category: "lotion" },
  { key: "nightCream", label: "面霜", category: "cream" },
];

export const ALL_SKIN_STEPS: SkinStep[] = [...DAY_STEPS, ...NIGHT_STEPS];

export interface SkinProductCategory {
  key: string;
  label: string;
}

// 护肤品管理固定类别（6 类，已移除眼霜）
export const SKIN_PRODUCT_CATEGORIES: SkinProductCategory[] = [
  { key: "cleanser", label: "洁面" },
  { key: "toner", label: "爽肤水" },
  { key: "serum", label: "精华" },
  { key: "lotion", label: "乳液" },
  { key: "cream", label: "面霜" },
  { key: "sunscreen", label: "防晒" },
];