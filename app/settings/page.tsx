"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DateField } from "@/components/ui/date-field";
import { Dialog } from "@/components/ui/dialog";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { toast } from "@/lib/store/use-toast-store";
import { todayKey } from "@/lib/utils/date";
import { exportAsXlsx } from "@/lib/utils/export";
import type { ExportCategory } from "@/lib/utils/export";
import { downloadJsonTemplate, importData } from "@/lib/utils/import";

const CATEGORY_OPTIONS: { key: ExportCategory; label: string }[] = [
  { key: "skin", label: "护肤" },
  { key: "training", label: "健身" },
  { key: "diet", label: "饮食" },
];

export default function SettingsPage() {
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayKey());
  const [categories, setCategories] = useState<ExportCategory[]>([
    "skin",
    "training",
    "diet",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (key: ExportCategory, checked: boolean) =>
    setCategories((c) => (checked ? (c.includes(key) ? c : [...c, key]) : c.filter((x) => x !== key)));

  const handleExport = () => {
    if (categories.length === 0) {
      toast("请至少选择一个导出栏目", "warning");
      return;
    }
    exportAsXlsx({
      categories,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    toast("已导出 Excel", "success");
    setExportOpen(false);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await importData(String(reader.result ?? ""));
        toast(
          `已导入并同步云端：护肤 ${result.skin} 条、健身 ${result.training} 条、饮食 ${result.diet} 条`,
          "success"
        );
      } catch {
        toast("导入失败：JSON 格式不正确或云端同步失败", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    useSkinStore.getState().reset();
    useTrainingStore.getState().reset();
    useDietStore.getState().reset();
    useBodyStore.getState().reset();
    toast("已清空全部数据", "warning");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">设置</h1>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">数据备份</p>
            <p className="mt-1 hidden text-xs text-muted-foreground lg:block">
              点击导出后选择日期范围与导出栏目，导出为 Excel（每个栏目一个 sheet）。
            </p>
          </div>
          <Button variant="outline" onClick={() => setExportOpen(true)} className="shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
            导出 Excel
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">数据导入</p>
            <p className="mt-1 hidden text-xs text-muted-foreground lg:block">
              下载 JSON 模板后按结构填写，导入护肤 / 健身 / 饮食数据。
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={downloadJsonTemplate}>
              <Download className="h-4 w-4" />
              下载模板
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              导入 JSON
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">危险操作</p>
            <p className="mt-1 hidden text-xs text-muted-foreground lg:block">
              清空护肤、训练、饮食与身体数据，且无法恢复。
            </p>
          </div>
          <Button variant="destructive" onClick={() => setConfirmClear(true)} className="shrink-0">
            <Trash2 className="h-4 w-4" />
            清空全部数据
          </Button>
        </div>
      </Card>

      <Dialog open={exportOpen} onOpenChange={setExportOpen} title="导出数据">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">开始日期</p>
              <DateField value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">结束日期</p>
              <DateField value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">导出栏目</p>
            <div className="flex flex-wrap gap-4">
              {CATEGORY_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt.key}
                  label={opt.label}
                  checked={categories.includes(opt.key)}
                  onCheckedChange={(v) => toggleCategory(opt.key, v)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              取消
            </Button>
            <Button onClick={handleExport}>
              <FileSpreadsheet className="h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="确认清空全部数据？"
        description="将删除所有护肤、训练、饮食与身体数据，且无法恢复。建议先导出 Excel 备份。"
        confirmLabel="确认清空"
        destructive
        onConfirm={handleClear}
      />
    </div>
  );
}