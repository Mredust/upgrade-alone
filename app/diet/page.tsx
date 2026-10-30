"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { DietForm } from "@/components/diet/diet-form";
import { DietList } from "@/components/diet/diet-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useDietStore } from "@/lib/store/use-diet-store";
import type { DietRecord } from "@/lib/types";

export default function DietPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DietRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const add = useDietStore((s) => s.add);
  const update = useDietStore((s) => s.update);
  const reset = useDietStore((s) => s.reset);

  const handleSubmit = (data: Omit<DietRecord, "id">) => {
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">饮食记录</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" />
            清理
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

      <DietList
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑饮食记录" : "新增饮食记录"}
      >
        <DietForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="确认清空饮食记录？"
        description="将删除所有饮食记录，且无法恢复。"
        confirmLabel="确认清理"
        destructive
        onConfirm={reset}
      />
    </div>
  );
}