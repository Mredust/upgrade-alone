"use client";

import { useMemo } from "react";

import { Heatmap } from "@/components/dashboard/heatmap";
import { Card } from "@/components/ui/card";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { calcBmi } from "@/lib/utils/bmi";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular">{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const skin = useSkinStore((s) => s.records);
  const training = useTrainingStore((s) => s.records);
  const diet = useDietStore((s) => s.records);
  const measures = useBodyStore((s) => s.measures);

  const latestMeasure = useMemo(
    () => measures.slice().sort((a, b) => b.date.localeCompare(a.date))[0],
    [measures]
  );
  const latestBmi = calcBmi(latestMeasure?.height, latestMeasure?.weight);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="护肤记录" value={`${skin.length} 天`} />
        <Stat label="训练记录" value={`${training.length} 次`} />
        <Stat label="饮食记录" value={`${diet.length} 天`} />
        <Stat label="最新 BMI" value={latestBmi ? latestBmi.toFixed(1) : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Heatmap title="护肤打卡" records={skin} />
        <Heatmap title="健身打卡" records={training} />
        <Heatmap title="饮食打卡" records={diet} />
      </div>
    </div>
  );
}