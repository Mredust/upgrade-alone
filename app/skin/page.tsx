"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { SkinForm } from "@/components/skin/skin-form";
import { SkinList } from "@/components/skin/skin-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useSkinStore } from "@/lib/store/use-skin-store";
import type { SkinRecord } from "@/lib/types";

export default function SkinPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkinRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const add = useSkinStore((s) => s.add);
  const update = useSkinStore((s) => s.update);
  const reset = useSkinStore((s) => s.reset);

  const handleSubmit = (data: Omit<SkinRecord, "id">) => {
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">护肤记录</h1>
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

      <SkinList
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑护肤记录" : "新增护肤记录"}
      >
        <SkinForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="确认清空护肤记录？"
        description="将删除所有护肤记录，且无法恢复。"
        confirmLabel="确认清理"
        destructive
        onConfirm={reset}
      />
    </div>
  );
}