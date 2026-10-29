import type { DietFood, MealKey } from "@/lib/types";

export interface MealDef {
  key: MealKey;
  label: string;
}

export const MEALS: MealDef[] = [
  { key: "breakfast", label: "早餐" },
  { key: "lunch", label: "午餐" },
  { key: "dinner", label: "晚餐" },
  { key: "nightSnack", label: "夜宵" },
  { key: "other", label: "其它" },
  { key: "milkTea", label: "奶茶" },
  { key: "fruit", label: "水果" },
];

export const EMPTY_MEALS = (): Record<MealKey, DietFood[]> => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  nightSnack: [],
  other: [],
  milkTea: [],
  fruit: [],
});