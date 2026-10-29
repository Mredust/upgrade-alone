"use client";

import { useMemo } from "react";
import { addDays, format, startOfWeek } from "date-fns";

interface HeatmapProps {
  records: { date: string }[];
  title: string;
  weeks?: number;
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export function Heatmap({ records, title, weeks = 12 }: HeatmapProps) {
  const cells = useMemo(() => {
    const today = new Date();
    const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), -(weeks - 1) * 7);
    const counts = new Map<string, number>();
    for (const r of records) counts.set(r.date, (counts.get(r.date) ?? 0) + 1);

    const grid: { date: string; count: number }[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(start, w * 7 + d);
        const key = format(day, "yyyy-MM-dd");
        col.push({ date: key, count: counts.get(key) ?? 0 });
      }
      grid.push(col);
    }
    return grid;
  }, [records, weeks]);

  return (
    <div className="rounded border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">近 {weeks} 周</span>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        <div className="flex shrink-0 flex-col gap-1 pr-1">
          {WEEKDAY_LABELS.map((l, i) => (
            <span
              key={i}
              className="flex h-3.5 items-center text-[10px] leading-none text-muted-foreground"
            >
              {l}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {cells.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}：${cell.count} 次`}
                  className={
                    cell.count > 0
                      ? "h-3.5 w-3.5 rounded-sm bg-success"
                      : "h-3.5 w-3.5 rounded-sm bg-muted"
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}