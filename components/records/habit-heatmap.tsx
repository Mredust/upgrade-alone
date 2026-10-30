"use client";

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import type { HabitRecord } from "@/lib/types";

export type HeatmapMode = "year" | "mobile";

interface HabitHeatmapProps {
  records: HabitRecord[];
  mode: HeatmapMode;
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

interface MonthBlock {
  key: string;
  label: string;
  weeks: (string | null)[][];
}

function buildMonthBlocks(mode: HeatmapMode): MonthBlock[] {
  const today = new Date();
  const firstDays: Date[] = [];

  if (mode === "year") {
    const year = today.getFullYear();
    for (let m = 0; m < 12; m++) firstDays.push(new Date(year, m, 1));
  } else {
    const thisMonth = startOfMonth(today);
    firstDays.push(subMonths(thisMonth, 1), thisMonth, addMonths(thisMonth, 1));
  }

  return firstDays.map((firstDay) => {
    const lastDay = endOfMonth(firstDay);
    const start = startOfWeek(firstDay, { weekStartsOn: 1 });

    const totalDays = Math.floor((lastDay.getTime() - start.getTime()) / 86400000) + 1;
    const weekCount = Math.ceil(totalDays / 7);

    const weeks: (string | null)[][] = [];
    for (let w = 0; w < weekCount; w++) {
      const col: (string | null)[] = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(start, w * 7 + d);
        const t = day.getTime();
        col.push(
          t >= firstDay.getTime() && t <= lastDay.getTime() ? format(day, "yyyy-MM-dd") : null
        );
      }
      weeks.push(col);
    }

    return { key: format(firstDay, "yyyy-MM"), label: format(firstDay, "M月"), weeks };
  });
}

function Cell({ record }: { record: HabitRecord | undefined }) {
  const a = record && record.a > 0;
  const b = record && record.b > 0;

  if (a && b) {
    return (
      <div className="flex h-3.5 w-3.5 flex-col overflow-hidden rounded-sm">
        <div className="h-1/2 w-full bg-success" />
        <div className="h-1/2 w-full bg-destructive" />
      </div>
    );
  }
  return (
    <div
      className={
        a
          ? "h-3.5 w-3.5 rounded-sm bg-success"
          : b
            ? "h-3.5 w-3.5 rounded-sm bg-destructive"
            : "h-3.5 w-3.5 rounded-sm bg-muted"
      }
    />
  );
}

export function HabitHeatmap({ records, mode }: HabitHeatmapProps) {
  const months = useMemo(() => buildMonthBlocks(mode), [mode]);

  const byDate = useMemo(() => {
    const map = new Map<string, HabitRecord>();
    for (const r of records) map.set(r.date, r);
    return map;
  }, [records]);

  return (
    <div className="rounded border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">记录热点图</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" /> A
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> B
          </span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        <div className="flex shrink-0 flex-col">
          <span className="mb-1 text-[10px] leading-none">&nbsp;</span>
          <div className="flex flex-col gap-1">
            {WEEKDAY_LABELS.map((l, i) => (
              <span
                key={i}
                className="flex h-3.5 items-center text-[10px] leading-none text-muted-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          {months.map((month) => (
            <div key={month.key} className="flex flex-col items-center">
              <span className="mb-1 text-[10px] leading-none text-muted-foreground">
                {month.label}
              </span>
              <div className="flex gap-1">
                {month.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((date, di) => {
                      if (date === null) {
                        return <div key={`blank-${wi}-${di}`} className="h-3.5 w-3.5 rounded-sm" />;
                      }
                      const record = byDate.get(date);
                      return <Cell key={date} record={record} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}