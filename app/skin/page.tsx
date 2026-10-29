"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { SkinForm } from "@/components/skin/skin-form";
import { SkinList } from "@/components/skin/skin-list";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useSkinStore } from "@/lib/store/use-skin-store";
import type { SkinRecord } from "@/lib/types";

export default function SkinPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkinRecord | null>(null);
  const add = useSkinStore((s) => s.add);
  const update = useSkinStore((s) => s.update);

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
    </div>
  );
}