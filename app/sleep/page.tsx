"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { SleepForm } from "@/components/sleep/sleep-form";
import { SleepList } from "@/components/sleep/sleep-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useSleepStore } from "@/lib/store/use-sleep-store";
import type { SleepRecord } from "@/lib/types";

export default function SleepPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SleepRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const add = useSleepStore((s) => s.add);
  const update = useSleepStore((s) => s.update);
  const reset = useSleepStore((s) => s.reset);

  const handleSubmit = (data: Omit<SleepRecord, "id">) => {
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">睡眠管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" />
            清除
          </Button>
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
      </div>

      <SleepList onEdit={(r) => {
        setEditing(r);
        setOpen(true);
      }} />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑睡眠记录" : "新增睡眠记录"}
      >
        <SleepForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="确认清除全部睡眠数据？"
        description="将删除所有睡眠记录，且无法恢复。"
        confirmLabel="确认清除"
        destructive
        onConfirm={reset}
      />
    </div>
  );
}