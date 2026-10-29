"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_MEALS, MEALS } from "@/lib/constants/diet-meals";
import type { DietFood, DietRecord, MealKey } from "@/lib/types";
import { todayKey } from "@/lib/utils/date";

interface DietFormProps {
  initial?: DietRecord;
  onSubmit: (data: Omit<DietRecord, "id">) => void;
  onCancel: () => void;
}

export function DietForm({ initial, onSubmit, onCancel }: DietFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [meals, setMeals] = useState<Record<MealKey, DietFood[]>>(
    initial?.meals ?? EMPTY_MEALS()
  );
  const [note, setNote] = useState(initial?.note ?? "");

  const toggleMeal = (key: MealKey, checked: boolean) =>
    setMeals((m) => ({
      ...m,
      [key]: checked ? (m[key].length ? m[key] : [{ name: "", weight: "" }]) : [],
    }));

  const addFood = (key: MealKey) =>
    setMeals((m) => ({ ...m, [key]: [...m[key], { name: "", weight: "" }] }));

  const removeFood = (key: MealKey, idx: number) =>
    setMeals((m) => ({ ...m, [key]: m[key].filter((_, i) => i !== idx) }));

  const setFood = (key: MealKey, idx: number, patch: Partial<DietFood>) =>
    setMeals((m) => ({
      ...m,
      [key]: m[key].map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({ date, meals, note });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div>
        {MEALS.map((meal) => {
          const list = meals[meal.key];
          const checked = list.length > 0;
          return (
            <div key={meal.key} className="border-b border-border py-2 last:border-0">
              <Checkbox
                label={meal.label}
                checked={checked}
                onCheckedChange={(v) => toggleMeal(meal.key, v)}
              />
              {checked && (
                <div className="mt-2 space-y-2 pl-4">
                  {list.map((food, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="食物"
                        value={food.name}
                        onChange={(e) => setFood(meal.key, i, { name: e.target.value })}
                        className="h-8 min-w-0 flex-[2]"
                      />
                      <Input
                        type="number"
                        placeholder="重量"
                        value={food.weight}
                        onChange={(e) => setFood(meal.key, i, { weight: e.target.value })}
                        className="h-8 min-w-0 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeFood(meal.key, i)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label="删除"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addFood(meal.key)}>
                    + 添加食物
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">备注</p>
        <Textarea placeholder="记录总热量、饱腹感等…" value={note} onChange={(e) => setNote(e.target.value)} />
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