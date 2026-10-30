"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TRAINING_GROUPS } from "@/lib/constants/training-groups";
import { useTrainingActionStore } from "@/lib/store/use-training-action-store";
import { useTrainingColumnStore } from "@/lib/store/use-training-column-store";

const MANAGED_GROUPS = TRAINING_GROUPS.filter((g) => g.key !== "rest");
const ROWS = 10;

export default function TrainingActionsPage() {
  const items = useTrainingActionStore((s) => s.items);
  const add = useTrainingActionStore((s) => s.add);
  const remove = useTrainingActionStore((s) => s.remove);

  const columns = useTrainingColumnStore((s) => s.columns);
  const addColumn = useTrainingColumnStore((s) => s.add);
  const removeColumn = useTrainingColumnStore((s) => s.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [group, setGroup] = useState("");
  const [name, setName] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");

  // 表头 = 固定 8 部位 + 自定义列
  const headers = [
    ...MANAGED_GROUPS.map((g) => ({ key: g.key, label: g.label })),
    ...columns.map((c) => ({ key: c.key, label: c.label })),
  ];

  const handleAdd = () => {
    const g = group.trim();
    const n = name.trim();
    if (!g || !n) return;
    add({ group: g, name: n });
    setDialogOpen(false);
    setGroup("");
    setName("");
  };

  const handleAddColumn = () => {
    const label = newColumnLabel.trim();
    if (!label) return;
    addColumn(label);
    setNewColumnLabel("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="返回设置"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">训练动作管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="shrink-0">
            <Pencil className="h-4 w-4" />
            编辑
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>
      </div>

      {/* PC 端：固定表格 */}
      <Card className="hidden p-4 lg:block">
        <p className="text-xs text-muted-foreground">
          按部位管理动作，供训练记录表单多选。
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((g) => (
                  <th
                    key={g.key}
                    className="whitespace-nowrap border border-border bg-muted px-3 py-2 text-center text-xs font-semibold"
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {headers.map((g) => {
                    const list = items.filter((i) => i.group === g.key);
                    const item = list[rowIdx];
                    return (
                      <td
                        key={g.key}
                        className="border border-border px-2 py-3 text-center text-xs"
                      >
                        {item ? (
                          <span className="inline-flex items-center gap-1">
                            {item.name}
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="删除"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 移动端：卡片列表 */}
      <div className="space-y-3 lg:hidden">
        {headers.map((g) => {
          const list = items.filter((i) => i.group === g.key);
          return (
            <Card key={g.key} className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{g.label}</p>
                <span className="text-xs text-muted-foreground">{list.length} 项</span>
              </div>
              {list.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">暂无动作</p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {list.map((i) => (
                    <span
                      key={i.id}
                      className="inline-flex items-center justify-between gap-1 border border-border bg-muted px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate">{i.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(i.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="删除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="新增动作">
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-medium">部位</p>
            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">请选择部位</option>
              {headers.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">动作名称</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入动作名称"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAdd}>确定</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen} title="编辑表头">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            胸、背、肩、腿、三头、二头、腹、有氧为固定表头，可在下方新增自定义列。
          </p>
          {columns.length === 0 ? (
            <p className="text-xs text-muted-foreground">暂无自定义列</p>
          ) : (
            <div className="space-y-2">
              {columns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <span className="text-sm">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => removeColumn(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="删除列"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Input
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            placeholder="自定义列名称"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddColumn} className="flex-1">
              添加
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">
              完成
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}