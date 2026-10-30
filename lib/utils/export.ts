import * as XLSX from "xlsx";

import { MEALS } from "@/lib/constants/diet-meals";
import { DAY_STEPS, NIGHT_STEPS, SKIN_PRODUCT_CATEGORIES } from "@/lib/constants/skin-steps";
import { TRAINING_GROUPS, TRAINING_GROUP_LABELS } from "@/lib/constants/training-groups";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useHabitStore } from "@/lib/store/use-habit-store";
import { useSkinProductStore } from "@/lib/store/use-skin-product-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useSleepStore } from "@/lib/store/use-sleep-store";
import { useTrainingActionStore } from "@/lib/store/use-training-action-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { calcBmi } from "./bmi";
import { calcTotalMinutes, formatDuration, isLateNight } from "./sleep";
import { formatTrainingAction } from "./training";

export type ExportCategory =
  | "skin"
  | "training"
  | "diet"
  | "sleep"
  | "records"
  | "body"
  | "skinProducts"
  | "trainingActions";

export interface ExportOptions {
  categories: ExportCategory[];
  startDate?: string;
  endDate?: string;
}

function buildExportFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const stamp = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${yyyy}-${mm}-${dd}-${stamp}.xlsx`;
}

function inRange(date: string, start?: string, end?: string): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function exportAsXlsx({ categories, startDate, endDate }: ExportOptions): void {
  const wb = XLSX.utils.book_new();

  if (categories.includes("skin")) {
    const header = [
      "日期",
      ...DAY_STEPS.map((s) => `日·${s.label}`),
      ...NIGHT_STEPS.map((s) => `夜·${s.label}`),
      "备注",
    ];
    const rows = useSkinStore
      .getState()
      .records.filter((r) => inRange(r.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [
        r.date,
        ...DAY_STEPS.map((s) => r.steps[s.key] ?? ""),
        ...NIGHT_STEPS.map((s) => r.steps[s.key] ?? ""),
        r.note,
      ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "护肤");
  }

  if (categories.includes("training")) {
    const rows = useTrainingStore
      .getState()
      .records.filter((r) => inRange(r.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => {
        const parts = r.bodyParts.map((k) => TRAINING_GROUP_LABELS[k] ?? k).join("、");
        const actions = r.actions.map(formatTrainingAction).join("、");
        return [r.date, parts, actions, r.note];
      });
    const ws = XLSX.utils.aoa_to_sheet([["日期", "部位", "动作明细", "备注"], ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "健身");
  }

  if (categories.includes("diet")) {
    const header = ["日期", ...MEALS.map((m) => m.label), "备注"];
    const rows = useDietStore
      .getState()
      .records.filter((r) => inRange(r.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [
        r.date,
        ...MEALS.map((m) =>
          (r.meals[m.key] ?? [])
            .map((f) => (f.weight ? `${f.name} ${f.weight}` : f.name))
            .join("、")
        ),
        r.note,
      ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "饮食");
  }

  if (categories.includes("sleep")) {
    const rows = useSleepStore
      .getState()
      .records.filter((r) => inRange(r.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [
        r.date,
        r.sleepTime,
        r.wakeTime,
        `${r.napMinutes}分钟`,
        formatDuration(calcTotalMinutes(r)),
        r.quality,
        isLateNight(r.sleepTime) ? "是" : "否",
      ]);
    const ws = XLSX.utils.aoa_to_sheet([
      ["日期", "入睡时间", "起床时间", "午睡时长", "总睡眠时长", "睡眠质量", "是否熬夜"],
      ...rows,
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "睡眠");
  }

  if (categories.includes("records")) {
    const rows: (string | number)[][] = [];
    useHabitStore
      .getState()
      .records.filter((r) => inRange(r.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((r) => {
        if (r.a > 0) rows.push([r.date, "A", r.a]);
        if (r.b > 0) rows.push([r.date, "B", r.b]);
      });
    const ws = XLSX.utils.aoa_to_sheet([["日期", "选项", "次数"], ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "记录");
  }

  if (categories.includes("body")) {
    const header = [
      "日期",
      "身高",
      "体重",
      "BMI",
      "腰围",
      "臀围",
      "左臂",
      "右臂",
      "左腿",
      "右腿",
      "备注",
    ];
    const rows = useBodyStore
      .getState()
      .measures.filter((m) => inRange(m.date, startDate, endDate))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => {
        const bmi = calcBmi(m.height, m.weight);
        return [
          m.date,
          m.height ?? "",
          m.weight ?? "",
          bmi !== undefined ? Number(bmi.toFixed(1)) : "",
          m.waist ?? "",
          m.hip ?? "",
          m.armLeft ?? "",
          m.armRight ?? "",
          m.thighLeft ?? "",
          m.thighRight ?? "",
          m.note ?? "",
        ];
      });
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "我的");
  }

  if (categories.includes("skinProducts")) {
    const header = SKIN_PRODUCT_CATEGORIES.map((c) => c.label);
    const products = useSkinProductStore.getState().products;
    const byCategory = SKIN_PRODUCT_CATEGORIES.map((c) =>
      products.filter((p) => p.category === c.key)
    );
    const maxRows = Math.max(0, ...byCategory.map((l) => l.length));
    const rows = Array.from({ length: maxRows }, (_, i) =>
      byCategory.map((l) => l[i]?.name ?? "")
    );
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "护肤品");
  }

  if (categories.includes("trainingActions")) {
    const groups = TRAINING_GROUPS.filter((g) => g.key !== "rest");
    const header = groups.map((g) => g.label);
    const items = useTrainingActionStore.getState().items;
    const byGroup = groups.map((g) => items.filter((i) => i.group === g.key));
    const maxRows = Math.max(0, ...byGroup.map((l) => l.length));
    const rows = Array.from({ length: maxRows }, (_, i) =>
      byGroup.map((l) => l[i]?.name ?? "")
    );
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "动作");
  }

  XLSX.writeFile(wb, buildExportFilename());
}