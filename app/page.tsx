"use client";

import { useMemo } from "react";

import { Heatmap } from "@/components/dashboard/heatmap";
import { Card } from "@/components/ui/card";
import { DAY_STEPS, NIGHT_STEPS } from "@/lib/constants/skin-steps";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { calcBmi } from "@/lib/utils/bmi";
import type { SkinRecord, TrainingRecord } from "@/lib/types";

const SKIN_DAY_KEYS = DAY_STEPS.map((s) => s.key);
const SKIN_NIGHT_KEYS = NIGHT_STEPS.map((s) => s.key);
// 兼容历史数据中的中文部位名「休息」
const REST_KEYS = new Set(["rest", "休息"]);

// 护肤：日间或夜间任意步骤有记录即算打卡；日、夜都为空则不算
function isSkinChecked(r: SkinRecord): boolean {
  const steps = r.steps ?? {};
  const hasDay = SKIN_DAY_KEYS.some((k) => (steps[k] ?? "").trim() !== "");
  const hasNight = SKIN_NIGHT_KEYS.some((k) => (steps[k] ?? "").trim() !== "");
  return hasDay || hasNight;
}

// 训练：有非「休息」部位才算打卡；空数组或仅休息不算
function isTrainingChecked(r: TrainingRecord): boolean {
  const parts = r.bodyParts ?? [];
  return parts.some((p) => !REST_KEYS.has(p));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 lg:p-4">
      <p className="text-[10px] text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-1 text-base font-semibold tabular sm:text-xl">{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const skin = useSkinStore((s) => s.records);
  const training = useTrainingStore((s) => s.records);
  const measures = useBodyStore((s) => s.measures);

  const latestMeasure = useMemo(
    () => measures.slice().sort((a, b) => b.date.localeCompare(a.date))[0],
    [measures]
  );
  const latestBmi = calcBmi(latestMeasure?.height, latestMeasure?.weight);
  const isDesktop = useIsDesktop();

  const skinChecked = useMemo(() => {
    const set = new Set<string>();
    for (const r of skin) if (isSkinChecked(r)) set.add(r.date);
    return set;
  }, [skin]);

  const trainingChecked = useMemo(() => {
    const set = new Set<string>();
    for (const r of training) if (isTrainingChecked(r)) set.add(r.date);
    return set;
  }, [training]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        <Stat label="护肤记录" value={`${skin.length} 天`} />
        <Stat label="训练记录" value={`${training.length} 次`} />
        <Stat label="最新 BMI" value={latestBmi ? latestBmi.toFixed(1) : "—"} />
      </div>

      <div className="space-y-3">
        <Heatmap
          title="护肤打卡"
          checkedDates={skinChecked}
          mode={isDesktop ? "year" : "mobile"}
        />
        <Heatmap
          title="健身打卡"
          checkedDates={trainingChecked}
          mode={isDesktop ? "year" : "mobile"}
        />
      </div>
    </div>
  );
}