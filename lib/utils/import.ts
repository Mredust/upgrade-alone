import { importRecords } from "@/lib/actions/records";
import { EMPTY_MEALS } from "@/lib/constants/diet-meals";
import { TRAINING_GROUP_LABELS, TRAINING_GROUPS } from "@/lib/constants/training-groups";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useHabitStore } from "@/lib/store/use-habit-store";
import { useSkinProductStore } from "@/lib/store/use-skin-product-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useSleepStore } from "@/lib/store/use-sleep-store";
import { useTrainingActionStore } from "@/lib/store/use-training-action-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import type {
  BodyMeasure,
  DietFood,
  DietRecord,
  HabitRecord,
  MealKey,
  SkinProduct,
  SkinRecord,
  SleepRecord,
  TrainingActionItem,
  TrainingRecord,
} from "@/lib/types";

type SkinInput = Omit<SkinRecord, "id">;
type TrainingInput = Omit<TrainingRecord, "id">;
type DietInput = Omit<DietRecord, "id">;
type SleepInput = Omit<SleepRecord, "id">;
type BodyInput = Omit<BodyMeasure, "id">;
type HabitInput = Omit<HabitRecord, "id">;
type SkinProductInput = Omit<SkinProduct, "id">;
type TrainingActionInput = Omit<TrainingActionItem, "id">;

interface ImportPayload {
  skin?: SkinInput[];
  training?: TrainingInput[];
  diet?: DietInput[];
  sleep?: SleepInput[];
  body?: BodyInput[];
  records?: HabitInput[];
  skinProducts?: SkinProductInput[];
  trainingActions?: TrainingActionInput[];
}

export interface ImportResult {
  skin: number;
  training: number;
  diet: number;
  sleep: number;
  body: number;
  records: number;
  skinProducts: number;
  trainingActions: number;
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
          dayLotion: "保湿乳",
          dayCream: "面霜",
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
    sleep: [
      {
        date: "2026-10-29",
        sleepTime: "23:30",
        wakeTime: "07:00",
        napMinutes: 30,
        quality: 85,
        note: "示例：sleepTime/wakeTime 为 HH:mm 24 小时制，napMinutes 为午睡分钟，quality 为 0-100",
      },
    ],
    body: [
      {
        date: "2026-10-29",
        height: 175,
        weight: 70,
        waist: 80,
        hip: 95,
        armLeft: 30,
        armRight: 30,
        thighLeft: 55,
        thighRight: 55,
        note: "示例：身高体重围度，BMI 由系统自动计算",
      },
    ],
    records: [
      {
        date: "2026-10-29",
        a: 1,
        b: 2,
      },
    ],
    skinProducts: [
      { category: "cleanser", name: "氨基酸洗面奶" },
      { category: "sunscreen", name: "清爽防晒霜" },
    ],
    trainingActions: [
      { group: "chest", name: "平板哑铃卧推" },
      { group: "back", name: "引体向上" },
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
  const sleep: SleepInput[] = [];

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

  if (Array.isArray(parsed.sleep)) {
    for (const r of parsed.sleep) {
      if (!r || !r.date) continue;
      sleep.push({
        date: String(r.date),
        sleepTime: String(r.sleepTime ?? ""),
        wakeTime: String(r.wakeTime ?? ""),
        napMinutes: Number(r.napMinutes ?? 0) || 0,
        quality: Number(r.quality ?? 0) || 0,
        note: r.note ?? "",
      });
    }
  }

  const body: BodyInput[] = [];
  if (Array.isArray(parsed.body)) {
    for (const m of parsed.body) {
      if (!m || !m.date) continue;
      body.push({
        date: String(m.date),
        height: m.height != null ? Number(m.height) : undefined,
        weight: m.weight != null ? Number(m.weight) : undefined,
        waist: m.waist != null ? Number(m.waist) : undefined,
        hip: m.hip != null ? Number(m.hip) : undefined,
        armLeft: m.armLeft != null ? Number(m.armLeft) : undefined,
        armRight: m.armRight != null ? Number(m.armRight) : undefined,
        thighLeft: m.thighLeft != null ? Number(m.thighLeft) : undefined,
        thighRight: m.thighRight != null ? Number(m.thighRight) : undefined,
        note: m.note ?? undefined,
      });
    }
  }

  const habitRecords: HabitInput[] = [];
  if (Array.isArray(parsed.records)) {
    for (const r of parsed.records) {
      if (!r || !r.date) continue;
      habitRecords.push({
        date: String(r.date),
        a: Number(r.a ?? 0) || 0,
        b: Number(r.b ?? 0) || 0,
      });
    }
  }

  const skinProducts: SkinProductInput[] = [];
  if (Array.isArray(parsed.skinProducts)) {
    for (const p of parsed.skinProducts) {
      if (!p || !p.name) continue;
      skinProducts.push({ category: String(p.category ?? ""), name: String(p.name) });
    }
  }

  const trainingActions: TrainingActionInput[] = [];
  if (Array.isArray(parsed.trainingActions)) {
    for (const i of parsed.trainingActions) {
      if (!i || !i.name) continue;
      trainingActions.push({ group: String(i.group ?? ""), name: String(i.name) });
    }
  }

  // 一次性写入云端，落库结果以服务端返回为准
  const written = await importRecords({
    skin,
    training,
    diet,
    sleep,
    body,
    habitRecords,
    skinProducts,
    trainingActionItems: trainingActions,
  });

  const skinStore = useSkinStore.getState();
  const trainingStore = useTrainingStore.getState();
  const dietStore = useDietStore.getState();
  const sleepStore = useSleepStore.getState();
  const bodyStore = useBodyStore.getState();
  const habitStore = useHabitStore.getState();
  const skinProductStore = useSkinProductStore.getState();
  const trainingActionStore = useTrainingActionStore.getState();

  skinStore.setRecords([...written.skin, ...skinStore.records]);
  trainingStore.setRecords([...written.training, ...trainingStore.records]);
  dietStore.setRecords([...written.diet, ...dietStore.records]);
  sleepStore.setRecords([...written.sleep, ...sleepStore.records]);
  bodyStore.setMeasures([...written.body, ...bodyStore.measures]);
  habitStore.setRecords([...written.habitRecords, ...habitStore.records]);
  skinProductStore.setProducts([...written.skinProducts, ...skinProductStore.products]);
  trainingActionStore.setItems([...written.trainingActionItems, ...trainingActionStore.items]);

  return {
    skin: written.skin.length,
    training: written.training.length,
    diet: written.diet.length,
    sleep: written.sleep.length,
    body: written.body.length,
    records: written.habitRecords.length,
    skinProducts: written.skinProducts.length,
    trainingActions: written.trainingActionItems.length,
  };
}