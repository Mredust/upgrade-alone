"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CARDIO_UNITS, TRAINING_GROUPS } from "@/lib/constants/training-groups";
import type { TrainingAction, TrainingRecord } from "@/lib/types";
import { todayKey } from "@/lib/utils/date";

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
  const [customName, setCustomName] = useState<Record<string, string>>({});

  const togglePart = (key: string) => {
    const has = bodyParts.includes(key);
    setBodyParts((p) => (has ? p.filter((x) => x !== key) : [...p, key]));
    if (has) {
      const group = TRAINING_GROUPS.find((g) => g.key === key);
      if (group) {
        setActions((a) =>
          a.filter((x) => !(group.actions.includes(x.name) || x.group === key))
        );
      }
    }
  };

  const toggleAction = (name: string) => {
    setActions((a) => {
      const exists = a.some((x) => x.name === name);
      if (exists) return a.filter((x) => x.name !== name);
      const unit = CARDIO_UNITS[name];
      if (unit) return [...a, { name, value: "", unit }];
      return [...a, { name, sets: "4", reps: "12" }];
    });
  };

  const patchAction = (name: string, patch: Partial<TrainingAction>) =>
    setActions((a) => a.map((x) => (x.name === name ? { ...x, ...patch } : x)));

  const patchCustomAction = (groupKey: string, name: string, patch: Partial<TrainingAction>) =>
    setActions((a) =>
      a.map((x) => (x.group === groupKey && x.name === name ? { ...x, ...patch } : x))
    );

  const addCustomAction = (groupKey: string) => {
    const name = (customName[groupKey] ?? "").trim();
    if (!name) return;
    setActions((a) => {
      if (a.some((x) => x.group === groupKey && x.name === name)) return a;
      return [...a, { name, sets: "4", reps: "12", group: groupKey }];
    });
    setCustomName((c) => ({ ...c, [groupKey]: "" }));
  };

  const removeCustomAction = (groupKey: string, name: string) =>
    setActions((a) => a.filter((x) => !(x.group === groupKey && x.name === name)));

  const handleSubmit = () => {
    if (!date) return;
    onSubmit({ date, bodyParts, actions, note });
  };

  const selectedGroups = TRAINING_GROUPS.filter((g) => bodyParts.includes(g.key));

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">日期</p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">训练部位</p>
        <div className="grid grid-cols-4 gap-2">
          {TRAINING_GROUPS.map((g) => (
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
        if (g.actions.length === 0) return null;
        const isCardio = g.key === "cardio";
        const customActions = actions.filter((a) => a.group === g.key);
        return (
          <div key={g.key}>
            <p className="mb-2 text-sm font-medium">{g.label} · 动作</p>
            <div className="space-y-2">
              {g.actions.map((name) => {
                const item = actions.find((a) => a.name === name);
                const checked = !!item;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Checkbox
                      label={name}
                      checked={checked}
                      onCheckedChange={() => toggleAction(name)}
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

              {customActions.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-36 shrink-0 truncate text-sm">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="组数"
                      value={item.sets ?? ""}
                      onChange={(e) => patchCustomAction(g.key, item.name, { sets: e.target.value })}
                      className="h-8 w-16"
                    />
                    <span className="text-xs text-muted-foreground">组</span>
                    <Input
                      type="number"
                      placeholder="次数"
                      value={item.reps ?? ""}
                      onChange={(e) => patchCustomAction(g.key, item.name, { reps: e.target.value })}
                      className="h-8 w-16"
                    />
                    <span className="text-xs text-muted-foreground">次</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomAction(g.key, item.name)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    aria-label="删除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Input
                  placeholder="输入自定义动作名称"
                  value={customName[g.key] ?? ""}
                  onChange={(e) => setCustomName((c) => ({ ...c, [g.key]: e.target.value }))}
                  className="h-8 flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => addCustomAction(g.key)}>
                  + 添加动作
                </Button>
              </div>
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