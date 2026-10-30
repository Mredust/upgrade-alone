export interface TrainingGroup {
  key: string;
  label: string;
}

// 训练部位（固定 8 个 + 休息）；动作列表已迁移到训练动作管理 store
export const TRAINING_GROUPS: TrainingGroup[] = [
  { key: "chest", label: "胸" },
  { key: "back", label: "背" },
  { key: "shoulder", label: "肩" },
  { key: "legs", label: "腿" },
  { key: "triceps", label: "三头" },
  { key: "biceps", label: "二头" },
  { key: "abs", label: "腹" },
  { key: "cardio", label: "有氧" },
  { key: "rest", label: "休息" },
];

export const CARDIO_UNITS: Record<string, string> = {
  跑步: "km",
  跳绳: "分钟",
};

export const TRAINING_GROUP_LABELS: Record<string, string> = Object.fromEntries(
  TRAINING_GROUPS.map((g) => [g.key, g.label])
);