import { EMPTY_MEALS } from "@/lib/constants/diet-meals";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import type { DietFood, DietRecord, MealKey, SkinRecord, TrainingRecord } from "@/lib/types";

type SkinInput = Omit<SkinRecord, "id">;
type TrainingInput = Omit<TrainingRecord, "id">;
type DietInput = Omit<DietRecord, "id">;

interface ImportPayload {
  skin?: SkinInput[];
  training?: TrainingInput[];
  diet?: DietInput[];
}

export interface ImportResult {
  skin: number;
  training: number;
  diet: number;
}

function sanitizeMeals(meals: unknown): Record<MealKey, DietFood[]> {
  const out = EMPTY_MEALS();
  const src = (meals ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(out) as MealKey[]) {
    const list: unknown[] = Array.isArray(src[key]) ? (src[key] as unknown[]) : [];
    out[key] = list.map((food: unknown) => {
      const f = (food ?? {}) as { name?: unknown; weight?: unknown };
      return { name: String(f.name ?? ""), weight: String(f.weight ?? "") };
    });
  }
  return out;
}

export function buildTemplatePayload(): ImportPayload {
  return {
    skin: [
      {
        date: "2026-10-29",
        steps: {
          dayCleanser: "氨基酸洁面",
          dayMoisturizer: "保湿乳",
          daySunscreen: "防晒霜",
        },
        note: "示例：steps 的 key 为护肤步骤，值填使用的产品",
      },
    ],
    training: [
      {
        date: "2026-10-29",
        bodyParts: ["chest", "back"],
        actions: [{ name: "上斜哑铃卧推", sets: "4", reps: "12" }],
        note: "示例：bodyParts 用部位 key，动作明细见 actions",
      },
    ],
    diet: [
      {
        date: "2026-10-29",
        meals: {
          breakfast: [{ name: "面包", weight: "100" }],
          lunch: [{ name: "鸡胸肉", weight: "200" }],
          dinner: [],
          nightSnack: [],
          other: [],
          milkTea: [],
          fruit: [],
        },
        note: "示例：weight 只填数字，单位由系统自动补充（奶茶为 L，其余为 g）",
      },
    ],
  };
}

export function downloadJsonTemplate(): void {
  const blob = new Blob([JSON.stringify(buildTemplatePayload(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "upgrade-alone-template.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(raw: string): ImportResult {
  const parsed = JSON.parse(raw) as ImportPayload;
  const result: ImportResult = { skin: 0, training: 0, diet: 0 };

  if (Array.isArray(parsed.skin)) {
    const store = useSkinStore.getState();
    for (const r of parsed.skin) {
      if (!r || !r.date) continue;
      store.add({ date: String(r.date), steps: r.steps ?? {}, note: r.note ?? "" });
      result.skin++;
    }
  }

  if (Array.isArray(parsed.training)) {
    const store = useTrainingStore.getState();
    for (const r of parsed.training) {
      if (!r || !r.date) continue;
      store.add({
        date: String(r.date),
        bodyParts: Array.isArray(r.bodyParts) ? r.bodyParts : [],
        actions: Array.isArray(r.actions) ? r.actions : [],
        note: r.note ?? "",
      });
      result.training++;
    }
  }

  if (Array.isArray(parsed.diet)) {
    const store = useDietStore.getState();
    for (const r of parsed.diet) {
      if (!r || !r.date) continue;
      store.add({
        date: String(r.date),
        meals: sanitizeMeals(r.meals),
        note: r.note ?? "",
      });
      result.diet++;
    }
  }

  return result;
}