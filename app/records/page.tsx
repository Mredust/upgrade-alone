"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { HabitHeatmap } from "@/components/records/habit-heatmap";
import { HabitList } from "@/components/records/habit-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DateField } from "@/components/ui/date-field";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { useHabitStore } from "@/lib/store/use-habit-store";
import { todayKey } from "@/lib/utils/date";
import type { HabitRecord } from "@/lib/types";

export default function RecordsPage() {
  const records = useHabitStore((s) => s.records);
  const save = useHabitStore((s) => s.save);
  const reset = useHabitStore((s) => s.reset);
  const isDesktop = useIsDesktop();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HabitRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [aChecked, setAChecked] = useState(false);
  const [aValue, setAValue] = useState(1);
  const [bChecked, setBChecked] = useState(false);
  const [bValue, setBValue] = useState(1);

  const openAdd = () => {
    setEditing(null);
    setDate(todayKey());
    setAChecked(false);
    setAValue(1);
    setBChecked(false);
    setBValue(1);
    setOpen(true);
  };

  const openEdit = (r: HabitRecord) => {
    setEditing(r);
    setDate(r.date);
    setAChecked(r.a > 0);
    setAValue(r.a > 0 ? r.a : 1);
    setBChecked(r.b > 0);
    setBValue(r.b > 0 ? r.b : 1);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!date) return;
    save(date, aChecked ? Number(aValue) || 1 : 0, bChecked ? Number(bValue) || 1 : 0);
    setOpen(false);
  };

  // 统计次数：勾选默认 1，数值大于 1 时按数值累加
  const aTotal = useMemo(
    () => records.reduce((sum, r) => sum + (r.a > 0 ? r.a : 0), 0),
    [records]
  );
  const bTotal = useMemo(
    () => records.reduce((sum, r) => sum + (r.b > 0 ? r.b : 0), 0),
    [records]
  );

  // 本年每月 A+B 次数
  const monthlyTotal = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
      let total = 0;
      for (const r of records) {
        if (r.date.startsWith(prefix)) {
          total += (r.a > 0 ? r.a : 0) + (r.b > 0 ? r.b : 0);
        }
      }
      return { label: `${i + 1}月`, total };
    });
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">记录管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" />
            清理
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            新增事项
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">A 总次数</p>
          <p className="mt-1 text-xl font-semibold tabular text-success">{aTotal}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">B 总次数</p>
          <p className="mt-1 text-xl font-semibold tabular text-destructive">{bTotal}</p>
        </Card>
        <Card className="col-span-2 p-3">
          <p className="text-xs text-muted-foreground">本年每月次数（A+B）</p>
          <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-12">
            {monthlyTotal.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-semibold tabular">{m.total}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <HabitHeatmap records={records} mode={isDesktop ? "year" : "mobile"} />

      <HabitList onEdit={openEdit} />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑事项" : "新增事项"}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium">日期</p>
            <DateField value={date} onChange={setDate} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">事项</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Checkbox
                  label="A"
                  checked={aChecked}
                  onCheckedChange={(v) => setAChecked(v)}
                />
                {aChecked && (
                  <Input
                    type="number"
                    min={1}
                    value={aValue}
                    onChange={(e) => setAValue(Number(e.target.value))}
                    className="w-24"
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <Checkbox
                  label="B"
                  checked={bChecked}
                  onCheckedChange={(v) => setBChecked(v)}
                />
                {bChecked && (
                  <Input
                    type="number"
                    min={1}
                    value={bValue}
                    onChange={(e) => setBValue(Number(e.target.value))}
                    className="w-24"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!aChecked && !bChecked}>
              保存
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="确认清空记录？"
        description="将删除所有 A/B 记录，且无法恢复。"
        confirmLabel="确认清理"
        destructive
        onConfirm={reset}
      />
    </div>
  );
}