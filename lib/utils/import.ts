import { importRecords } from "@/lib/actions/records";
import { EMPTY_MEALS } from "@/lib/constants/diet-meals";
import { TRAINING_GROUP_LABELS, TRAINING_GROUPS } from "@/lib/constants/training-groups";
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

// 中文部位名 -> 部位 key（兼容外部导出的历史数据）
const LABEL_TO_KEY: Record<string, string> = {
  ...Object.fromEntries(TRAINING_GROUPS.map((g) => [g.label, g.key] as const)),
  腹肌: "abs",
};

function normalizeBodyParts(parts: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of parts) {
    const key = TRAINING_GROUP_LABELS[raw] ? raw : (LABEL_TO_KEY[raw] ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
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

export async function importData(raw: string): Promise<ImportResult> {
  const parsed = JSON.parse(raw) as ImportPayload;

  const skin: SkinInput[] = [];
  const training: TrainingInput[] = [];
  const diet: DietInput[] = [];

  if (Array.isArray(parsed.skin)) {
    for (const r of parsed.skin) {
      if (!r || !r.date) continue;
      skin.push({ date: String(r.date), steps: r.steps ?? {}, note: r.note ?? "" });
    }
  }

  if (Array.isArray(parsed.training)) {
    for (const r of parsed.training) {
      if (!r || !r.date) continue;
      training.push({
        date: String(r.date),
        bodyParts: normalizeBodyParts(Array.isArray(r.bodyParts) ? r.bodyParts : []),
        actions: Array.isArray(r.actions) ? r.actions : [],
        note: r.note ?? "",
      });
    }
  }

  if (Array.isArray(parsed.diet)) {
    for (const r of parsed.diet) {
      if (!r || !r.date) continue;
      diet.push({ date: String(r.date), meals: sanitizeMeals(r.meals), note: r.note ?? "" });
    }
  }

  // 一次性写入云端，落库结果以服务端返回为准
  const written = await importRecords({ skin, training, diet });

  const skinStore = useSkinStore.getState();
  const trainingStore = useTrainingStore.getState();
  const dietStore = useDietStore.getState();

  skinStore.setRecords([...written.skin, ...skinStore.records]);
  trainingStore.setRecords([...written.training, ...trainingStore.records]);
  dietStore.setRecords([...written.diet, ...dietStore.records]);

  return {
    skin: written.skin.length,
    training: written.training.length,
    diet: written.diet.length,
  };
}