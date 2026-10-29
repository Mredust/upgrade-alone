export interface SkinRecord {
  id: string;
  date: string; // YYYY-MM-DD
  steps: Record<string, string>; // step key -> product name（key 存在即视为已打卡）
  note: string;
}

export interface TrainingAction {
  name: string;
  sets?: string; // 组数
  reps?: string; // 每组次数
  value?: string; // 有氧数值
  unit?: string; // 有氧单位
  group?: string; // 所属部位 key（自定义动作）
}

export interface TrainingRecord {
  id: string;
  date: string;
  bodyParts: string[]; // group key
  actions: TrainingAction[];
  note: string;
}

export type MealKey =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "nightSnack"
  | "other"
  | "milkTea"
  | "fruit";

export interface DietFood {
  name: string;
  weight: string;
}

export interface DietRecord {
  id: string;
  date: string;
  meals: Record<MealKey, DietFood[]>;
  note: string;
}

export interface BodyMeasure {
  id: string;
  date: string;
  height?: number; // cm
  weight?: number; // kg
  waist?: number;
  hip?: number;
  armLeft?: number;
  armRight?: number;
  thighLeft?: number;
  thighRight?: number;
  note?: string;
}