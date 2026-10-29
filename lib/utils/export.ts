import * as XLSX from "xlsx";

import { MEALS } from "@/lib/constants/diet-meals";
import { DAY_STEPS, NIGHT_STEPS } from "@/lib/constants/skin-steps";
import { TRAINING_GROUP_LABELS } from "@/lib/constants/training-groups";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { formatTrainingAction } from "./training";

export type ExportCategory = "skin" | "training" | "diet";

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

  XLSX.writeFile(wb, buildExportFilename());
}