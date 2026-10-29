"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BodyMeasure } from "@/lib/types";
import { calcBmi, bmiCategory } from "@/lib/utils/bmi";
import { todayKey } from "@/lib/utils/date";

type NumericField =
  | "height"
  | "weight"
  | "waist"
  | "hip"
  | "armLeft"
  | "armRight"
  | "thighLeft"
  | "thighRight";

const FIELDS: { key: NumericField; label: string; unit: string }[] = [
  { key: "height", label: "身高", unit: "cm" },
  { key: "weight", label: "体重", unit: "kg" },
  { key: "waist", label: "腰围", unit: "cm" },
  { key: "hip", label: "臀围", unit: "cm" },
  { key: "armLeft", label: "左臂围", unit: "cm" },
  { key: "armRight", label: "右臂围", unit: "cm" },
  { key: "thighLeft", label: "左腿围", unit: "cm" },
  { key: "thighRight", label: "右腿围", unit: "cm" },
];

function num(v: string): number | undefined {
  const t = v.trim();
  return t === "" ? undefined : Number(t);
}

interface MeasureFormProps {
  initial?: BodyMeasure;
  onSubmit: (data: Omit<BodyMeasure, "id">) => void;
  onCancel: () => void;
}

export function MeasureForm({ initial, onSubmit, onCancel }: MeasureFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [form, setForm] = useState<Record<NumericField, string>>(() => ({
    height: initial?.height?.toString() ?? "166",
    weight: initial?.weight?.toString() ?? "",
    waist: initial?.waist?.toString() ?? "",
    hip: initial?.hip?.toString() ?? "",
    armLeft: initial?.armLeft?.toString() ?? "",
    armRight: initial?.armRight?.toString() ?? "",
    thighLeft: initial?.thighLeft?.toString() ?? "",
    thighRight: initial?.thighRight?.toString() ?? "",
  }));
  const [note, setNote] = useState(initial?.note ?? "");

  const setField = (key: NumericField, v: string) => setForm((f) => ({ ...f, [key]: v }));

  const bmi = calcBmi(num(form.height), num(form.weight));

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({
      date,
      height: num(form.height),
      weight: num(form.weight),
      waist: num(form.waist),
      hip: num(form.hip),
      armLeft: num(form.armLeft),
      armRight: num(form.armRight),
      thighLeft: num(form.thighLeft),
      thighRight: num(form.thighRight),
      note,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <p className="mb-1 text-sm text-muted-foreground">
              {f.label}（{f.unit}）
            </p>
            <Input
              type="number"
              inputMode="decimal"
              value={form[f.key]}
              onChange={(e) => setField(f.key, e.target.value)}
              placeholder="选填"
            />
          </div>
        ))}
      </div>

      {bmi !== undefined && (
        <p className="text-sm">
          当前 BMI：<span className="font-semibold tabular">{bmi.toFixed(1)}</span>{" "}
          <span className={bmiCategory(bmi).className}>{bmiCategory(bmi).label}</span>
        </p>
      )}

      <div>
        <p className="mb-1 text-sm font-medium">备注</p>
        <Textarea placeholder="补充说明…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSubmit}>保存</Button>
      </div>
    </div>
  );
}