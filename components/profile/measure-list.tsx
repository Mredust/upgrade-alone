"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { useBodyStore } from "@/lib/store/use-body-store";
import type { BodyMeasure } from "@/lib/types";
import { calcBmi, bmiCategory } from "@/lib/utils/bmi";

interface MeasureListProps {
  onEdit: (m: BodyMeasure) => void;
}

const PAGE_STEP = 10;

function cell(v: number | undefined, unit: string): string {
  return v !== undefined ? `${v}${unit}` : "—";
}

export function MeasureList({ onEdit }: MeasureListProps) {
  const measures = useBodyStore((s) => s.measures);
  const remove = useBodyStore((s) => s.remove);
  const isDesktop = useIsDesktop();

  // PC 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // 移动端无限滚动
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  const sorted = [...measures].sort((a, b) => b.date.localeCompare(a.date));
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

  if (measures.length === 0) {
    return (
      <div className="rounded border border-border py-12 text-center text-sm text-muted-foreground">
        暂无身体数据，点击右上角“新增”开始记录
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
              <th className="px-3 py-2 font-medium">身高</th>
              <th className="px-3 py-2 font-medium">体重</th>
              <th className="px-3 py-2 font-medium">BMI</th>
              <th className="px-3 py-2 font-medium">腰围</th>
              <th className="px-3 py-2 font-medium">臀围</th>
              <th className="px-3 py-2 font-medium">左臂</th>
              <th className="px-3 py-2 font-medium">右臂</th>
              <th className="px-3 py-2 font-medium">左腿</th>
              <th className="px-3 py-2 font-medium">右腿</th>
              <th className="px-3 py-2 font-medium">备注</th>
              <th className="sticky right-0 z-10 bg-muted px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => {
              const bmi = calcBmi(m.height, m.weight);
              const cat = bmi !== undefined ? bmiCategory(bmi) : null;
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-3 py-2 tabular">
                    <span className="lg:hidden">{m.date.slice(5)}</span>
                    <span className="hidden lg:inline">{m.date}</span>
                  </td>
                  <td className="px-3 py-2 tabular">{cell(m.height, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.weight, "")}</td>
                  <td className="px-3 py-2 tabular">
                    {bmi !== undefined ? (
                      <span className={cat?.className}>
                        {bmi.toFixed(1)}
                        {cat ? ` ${cat.label}` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 tabular">{cell(m.waist, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.hip, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.armLeft, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.armRight, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.thighLeft, "")}</td>
                  <td className="px-3 py-2 tabular">{cell(m.thighRight, "")}</td>
                  <td className="max-w-[140px] truncate px-3 py-2 text-muted-foreground">
                    {m.note || "—"}
                  </td>
                  <td className="sticky right-0 z-10 bg-card px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(m)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
    </div>
  );
}