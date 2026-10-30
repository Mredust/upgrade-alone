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

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD 入睡日期
  sleepTime: string; // "HH:mm" 入睡时间
  wakeTime: string; // "HH:mm" 起床时间（可跨天）
  napMinutes: number; // 午睡时长（分钟）
  quality: number; // 睡眠质量自评 0-100
  note: string;
}

export interface HabitRecord {
  id: string;
  date: string; // YYYY-MM-DD
  a: number; // A 事项数值，0 表示未勾选
  b: number; // B 事项数值，0 表示未勾选
}

export interface SkinProduct {
  id: string;
  category: string; // 产品类别 key（洁面/爽肤水/眼霜/精华/乳液/面霜/防晒）
  name: string;
}

export interface TrainingActionItem {
  id: string;
  group: string; // 部位 key（胸/背/肩/腿/三头/二头/腹/有氧）
  name: string;
}

// 管理页自定义列（护肤品类别 / 训练部位），key 用于产品/动作的关联
export interface CustomColumn {
  id: string;
  key: string;
  label: string;
}