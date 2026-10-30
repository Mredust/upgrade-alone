"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CARDIO_UNITS, TRAINING_GROUPS } from "@/lib/constants/training-groups";
import { useTrainingActionStore } from "@/lib/store/use-training-action-store";
import { useTrainingColumnStore } from "@/lib/store/use-training-column-store";
import type { TrainingAction, TrainingRecord } from "@/lib/types";
import { todayKey } from "@/lib/utils/date";

const MANAGED_GROUPS = TRAINING_GROUPS.filter((g) => g.key !== "rest");
const REST_GROUP = TRAINING_GROUPS.find((g) => g.key === "rest");

interface TrainingFormProps {
  initial?: TrainingRecord;
  onSubmit: (data: Omit<TrainingRecord, "id">) => void;
  onCancel: () => void;
}

export function TrainingForm({ initial, onSubmit, onCancel }: TrainingFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayKey());
  const [bodyParts, setBodyParts] = useState<string[]>(initial?.bodyParts ?? []);
  const [actions, setActions] = useState<TrainingAction[]>(initial?.actions ?? []);
  const [note, setNote] = useState(initial?.note ?? "");
  const customItems = useTrainingActionStore((s) => s.items);
  const columns = useTrainingColumnStore((s) => s.columns);

  // 部位/动作来自训练动作管理表头（固定 8 部位 + 自定义列），休息作为特殊部位保留在最后
  const allGroups = [
    ...MANAGED_GROUPS.map((g) => ({ key: g.key, label: g.label })),
    ...columns.map((c) => ({ key: c.key, label: c.label })),
    ...(REST_GROUP ? [{ key: REST_GROUP.key, label: REST_GROUP.label }] : []),
  ];

  // 每组动作列表直接来自训练动作管理
  const groupActionNames = (groupKey: string): string[] =>
    Array.from(new Set(customItems.filter((i) => i.group === groupKey).map((i) => i.name)));

  const togglePart = (key: string) => {
    const has = bodyParts.includes(key);
    setBodyParts((p) => (has ? p.filter((x) => x !== key) : [...p, key]));
    if (has) {
      const names = new Set(groupActionNames(key));
      setActions((a) => a.filter((x) => !names.has(x.name)));
    }
  };

  const toggleAction = (name: string, isCardio: boolean) => {
    setActions((a) => {
      const exists = a.some((x) => x.name === name);
      if (exists) return a.filter((x) => x.name !== name);
      if (isCardio) {
        const unit = CARDIO_UNITS[name] ?? "分钟";
        return [...a, { name, value: "", unit }];
      }
      return [...a, { name, sets: "4", reps: "12" }];
    });
  };

  const patchAction = (name: string, patch: Partial<TrainingAction>) =>
    setActions((a) => a.map((x) => (x.name === name ? { ...x, ...patch } : x)));

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({ date, bodyParts, actions, note });
  };

  const selectedGroups = allGroups.filter((g) => bodyParts.includes(g.key));

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">训练部位</p>
        <div className="grid grid-cols-4 gap-2">
          {allGroups.map((g) => (
            <Checkbox
              key={g.key}
              label={g.label}
              checked={bodyParts.includes(g.key)}
              onCheckedChange={() => togglePart(g.key)}
            />
          ))}
        </div>
      </div>

      {selectedGroups.map((g) => {
        const isCardio = g.key === "cardio";
        const names = groupActionNames(g.key);
        if (names.length === 0) return null;
        return (
          <div key={g.key}>
            <p className="mb-2 text-sm font-medium">{g.label} · 动作</p>
            <div className="space-y-2">
              {names.map((name) => {
                const item = actions.find((a) => a.name === name);
                const checked = !!item;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Checkbox
                      label={name}
                      checked={checked}
                      onCheckedChange={() => toggleAction(name, isCardio)}
                      className="w-36 shrink-0"
                    />
                    {checked && isCardio && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item?.value ?? ""}
                          onChange={(e) => patchAction(name, { value: e.target.value })}
                          className="h-8 w-20"
                        />
                        <span className="text-xs text-muted-foreground">{item?.unit ?? ""}</span>
                      </div>
                    )}
                    {checked && !isCardio && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder="组数"
                          value={item?.sets ?? ""}
                          onChange={(e) => patchAction(name, { sets: e.target.value })}
                          className="h-8 w-16"
                        />
                        <span className="text-xs text-muted-foreground">组</span>
                        <Input
                          type="number"
                          placeholder="次数"
                          value={item?.reps ?? ""}
                          onChange={(e) => patchAction(name, { reps: e.target.value })}
                          className="h-8 w-16"
                        />
                        <span className="text-xs text-muted-foreground">次</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div>
        <p className="mb-1 text-sm font-medium">备注</p>
        <Textarea placeholder="记录重量、组数或体感…" value={note} onChange={(e) => setNote(e.target.value)} />
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