"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { TrainingForm } from "@/components/training/training-form";
import { TrainingList } from "@/components/training/training-list";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTrainingStore } from "@/lib/store/use-training-store";
import type { TrainingRecord } from "@/lib/types";

export default function TrainingPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingRecord | null>(null);
  const add = useTrainingStore((s) => s.add);
  const update = useTrainingStore((s) => s.update);

  const handleSubmit = (data: Omit<TrainingRecord, "id">) => {
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">训练记录</h1>
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

      <TrainingList
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "编辑训练记录" : "新增训练记录"}
      >
        <TrainingForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}