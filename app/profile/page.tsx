"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { MeasureForm } from "@/components/profile/measure-form";
import { MeasureList } from "@/components/profile/measure-list";
import { TrendChart } from "@/components/profile/trend-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useBodyStore } from "@/lib/store/use-body-store";
import type { BodyMeasure } from "@/lib/types";
import { calcBmi, bmiCategory } from "@/lib/utils/bmi";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BodyMeasure | null>(null);
  const measures = useBodyStore((s) => s.measures);
  const add = useBodyStore((s) => s.add);
  const update = useBodyStore((s) => s.update);

  const latest = useMemo(
    () => measures.slice().sort((a, b) => b.date.localeCompare(a.date))[0],
    [measures]
  );
  const latestBmi = calcBmi(latest?.height, latest?.weight);
  const cat = latestBmi !== undefined ? bmiCategory(latestBmi) : null;

  const handleSubmit = (data: Omit<BodyMeasure, "id">) => {
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">我的</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          新增
        </Button>
      </div>

      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold">BMI / 体重趋势</p>
        <TrendChart />
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground">最新 BMI</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular">
            {latestBmi !== undefined ? latestBmi.toFixed(1) : "—"}
          </span>
          {cat && <span className={`text-sm ${cat.className}`}>{cat.label}</span>}
        </div>
        {latest && (
          <p className="mt-1 text-xs text-muted-foreground">
            身高 {latest.height ?? "—"}cm · 体重 {latest.weight ?? "—"}kg · {latest.date}
          </p>
        )}
      </Card>

      <MeasureList
        onEdit={(m) => {
          setEditing(m);
          setOpen(true);
        }}
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑身体数据" : "新增身体数据"}
      >
        <MeasureForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}