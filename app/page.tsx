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

interface CheckinCardProps {
  recordLabel: string;
  rateLabel: string;
  total: number;
  thisMonth: number;
  rate: string;
}

function CheckinCard({ recordLabel, rateLabel, total, thisMonth, rate }: CheckinCardProps) {
  return (
    <Card className="p-3 lg:p-4">
      <div className="grid grid-cols-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">{recordLabel}</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{total}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">本月</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{thisMonth}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">{rateLabel}</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{rate}</p>
        </div>
      </div>
    </Card>
  );
}

function BmiCard({ value }: { value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">BMI</p>
      <p className="mt-1 text-xl font-semibold tabular">{value}</p>
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

  const skinCheckedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of skin) if (isSkinChecked(r)) set.add(r.date);
    return set;
  }, [skin]);

  const trainingCheckedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of training) if (isTrainingChecked(r)) set.add(r.date);
    return set;
  }, [training]);

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const skinTotal = skinCheckedDates.size;
  const trainingTotal = trainingCheckedDates.size;

  const skinThisMonth = skin.filter(
    (r) => isSkinChecked(r) && r.date.startsWith(monthPrefix)
  ).length;
  const trainingThisMonth = training.filter(
    (r) => isTrainingChecked(r) && r.date.startsWith(monthPrefix)
  ).length;

  const skinRate = daysInMonth > 0 ? Math.round((skinThisMonth / daysInMonth) * 100) : 0;
  const trainingRate = daysInMonth > 0 ? Math.round((trainingThisMonth / daysInMonth) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
        <CheckinCard
          recordLabel="护肤记录"
          rateLabel="护肤率"
          total={skinTotal}
          thisMonth={skinThisMonth}
          rate={`${skinRate}%`}
        />
        <CheckinCard
          recordLabel="训练记录"
          rateLabel="训练率"
          total={trainingTotal}
          thisMonth={trainingThisMonth}
          rate={`${trainingRate}%`}
        />
        <div className="hidden lg:block">
          <BmiCard value={latestBmi ? latestBmi.toFixed(1) : "—"} />
        </div>
      </div>

      <div className="space-y-3">
        <Heatmap
          title="护肤打卡"
          checkedDates={skinCheckedDates}
          mode={isDesktop ? "year" : "mobile"}
        />
        <Heatmap
          title="健身打卡"
          checkedDates={trainingCheckedDates}
          mode={isDesktop ? "year" : "mobile"}
        />
      </div>
    </div>
  );
}