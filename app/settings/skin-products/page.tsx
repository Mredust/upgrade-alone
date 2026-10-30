"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SKIN_PRODUCT_CATEGORIES } from "@/lib/constants/skin-steps";
import { useSkinColumnStore } from "@/lib/store/use-skin-column-store";
import { useSkinProductStore } from "@/lib/store/use-skin-product-store";

const ROWS = 10;

export default function SkinProductsPage() {
  const products = useSkinProductStore((s) => s.products);
  const add = useSkinProductStore((s) => s.add);
  const remove = useSkinProductStore((s) => s.remove);

  const columns = useSkinColumnStore((s) => s.columns);
  const addColumn = useSkinColumnStore((s) => s.add);
  const removeColumn = useSkinColumnStore((s) => s.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");

  // 表头 = 固定 6 类 + 自定义列
  const headers = [
    ...SKIN_PRODUCT_CATEGORIES,
    ...columns.map((c) => ({ key: c.key, label: c.label })),
  ];

  const handleAdd = () => {
    const c = category.trim();
    const n = name.trim();
    if (!c || !n) return;
    add({ category: c, name: n });
    setDialogOpen(false);
    setCategory("");
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
          <h1 className="text-lg font-semibold">护肤品管理</h1>
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
          按类别管理产品，供护肤记录表单下拉选择。
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((cat) => (
                  <th
                    key={cat.key}
                    className="whitespace-nowrap border border-border bg-muted px-3 py-2 text-center text-xs font-semibold"
                  >
                    {cat.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {headers.map((cat) => {
                    const list = products.filter((p) => p.category === cat.key);
                    const item = list[rowIdx];
                    return (
                      <td
                        key={cat.key}
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
        {headers.map((cat) => {
          const list = products.filter((p) => p.category === cat.key);
          return (
            <Card key={cat.key} className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{cat.label}</p>
                <span className="text-xs text-muted-foreground">{list.length} 项</span>
              </div>
              {list.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">暂无产品</p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {list.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center justify-between gap-1 border border-border bg-muted px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate">{p.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="新增产品">
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-medium">类别</p>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">请选择类别</option>
              {headers.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">产品名称</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入产品名称"
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
            洁面、爽肤水、精华、乳液、面霜、防晒为固定表头，可在下方新增自定义列。
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