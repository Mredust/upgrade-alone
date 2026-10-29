"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DAY_STEPS, NIGHT_STEPS } from "@/lib/constants/skin-steps";
import type { SkinRecord } from "@/lib/types";
import { todayKey } from "@/lib/utils/date";

interface SkinFormProps {
  initial?: SkinRecord;
  onSubmit: (data: Omit<SkinRecord, "id">) => void;
  onCancel: () => void;
}

export function SkinForm({ initial, onSubmit, onCancel }: SkinFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [steps, setSteps] = useState<Record<string, string>>(initial?.steps ?? {});
  const [note, setNote] = useState(initial?.note ?? "");

  const toggle = (key: string, checked: boolean) =>
    setSteps((s) => {
      const next = { ...s };
      if (checked) {
        if (!(key in next)) next[key] = "";
      } else {
        delete next[key];
      }
      return next;
    });

  const setProduct = (key: string, v: string) => setSteps((s) => ({ ...s, [key]: v }));

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({ date, steps, note });
  };

  const renderSteps = (list: typeof DAY_STEPS) => (
    <div className="space-y-2">
      {list.map((s) => {
        const checked = s.key in steps;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <Checkbox
              label={s.label}
              checked={checked}
              onCheckedChange={(v) => toggle(s.key, v)}
              className="w-32 shrink-0"
            />
            {checked && (
              <Input
                placeholder="使用的产品"
                value={steps[s.key] ?? ""}
                onChange={(e) => setProduct(s.key, e.target.value)}
                className="h-8 flex-1"
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">日间护肤步骤</p>
        {renderSteps(DAY_STEPS)}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">夜间护肤步骤</p>
        {renderSteps(NIGHT_STEPS)}
      </div>

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