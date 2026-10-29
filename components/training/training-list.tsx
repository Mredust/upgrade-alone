"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { TRAINING_GROUP_LABELS } from "@/lib/constants/training-groups";
import { useTrainingStore } from "@/lib/store/use-training-store";
import type { TrainingRecord } from "@/lib/types";
import { formatTrainingAction } from "@/lib/utils/training";

interface TrainingListProps {
  onEdit: (r: TrainingRecord) => void;
}

const PAGE_STEP = 10;

export function TrainingList({ onEdit }: TrainingListProps) {
  const records = useTrainingStore((s) => s.records);
  const remove = useTrainingStore((s) => s.remove);
  const [target, setTarget] = useState<TrainingRecord | null>(null);
  const isDesktop = useIsDesktop();

  // PC 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // 移动端无限滚动
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const hasMoreInfinite = visibleCount < total;

  const visible = isDesktop
    ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sorted.slice(0, visibleCount);

  useInfiniteScroll(
    () => setVisibleCount((c) => c + PAGE_STEP),
    hasMoreInfinite && !isDesktop
  );

  if (records.length === 0) {
    return (
      <div className="rounded border border-border py-12 text-center text-sm text-muted-foreground">
        暂无训练记录，点击右上角“新增”开始记录
      </div>
    );
  }

  return (
    <div className="rounded border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">日期</th>
              <th className="px-3 py-2 font-medium">部位</th>
              <th className="px-3 py-2 font-medium">动作</th>
              <th className="px-3 py-2 font-medium">备注</th>
              <th className="sticky right-0 z-10 bg-muted px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 tabular">
                  <span className="lg:hidden">{r.date.slice(5)}</span>
                  <span className="hidden lg:inline">{r.date}</span>
                </td>
                <td className="px-3 py-2">
                  {r.bodyParts.map((k) => TRAINING_GROUP_LABELS[k] ?? k).join("、") || "—"}
                </td>
                <td className="max-w-[280px] truncate px-3 py-2 text-muted-foreground">
                  {r.actions.map(formatTrainingAction).join("、") || "—"}
                </td>
                <td className="max-w-[160px] truncate px-3 py-2 text-muted-foreground">
                  {r.note || "—"}
                </td>
                <td className="sticky right-0 z-10 bg-card px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarget(r)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      aria-label="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDesktop ? (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : (
        <div className="border-t border-border py-2 text-center text-xs text-muted-foreground">
          {hasMoreInfinite ? "向下滑动加载更多…" : "已加载全部"}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        title="确认删除该训练记录？"
        description={target ? `将删除 ${target.date} 的训练记录，且无法恢复。` : undefined}
        confirmLabel="删除"
        destructive
        onConfirm={() => {
          if (target) remove(target.id);
        }}
      />
    </div>
  );
}