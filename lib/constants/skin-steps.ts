export interface SkinStep {
  key: string;
  label: string;
}

export const DAY_STEPS: SkinStep[] = [
  { key: "dayCleanser", label: "洁面" },
  { key: "dayToner", label: "爽肤水" },
  { key: "dayEyeCream", label: "眼霜" },
  { key: "daySerum", label: "精华" },
  { key: "dayMoisturizer", label: "乳液/面霜" },
  { key: "daySunscreen", label: "防晒" },
];

export const NIGHT_STEPS: SkinStep[] = [
  { key: "nightMakeupRemove", label: "卸妆" },
  { key: "nightCleanser", label: "洁面" },
  { key: "nightToner", label: "爽肤水" },
  { key: "nightEyeCream", label: "眼霜" },
  { key: "nightSerum", label: "精华" },
  { key: "nightMoisturizer", label: "乳液/面霜" },
  { key: "nightSpecial", label: "特殊护理" },
];

export const ALL_SKIN_STEPS: SkinStep[] = [...DAY_STEPS, ...NIGHT_STEPS];