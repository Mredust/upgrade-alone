"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type { SleepRecord } from "@/lib/types";
import { computeSleepStats, minutesToTime, timeToMinutes } from "@/lib/utils/sleep";

interface SleepReportProps {
  records: SleepRecord[];
}

// 平均时长缩写：xxhxxmin
function shortDuration(min: number): string {
  if (!min || min <= 0) return "0h00min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, "0")}min`;
}

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center rounded border border-border text-sm text-muted-foreground">
      暂无数据
    </div>
  );
}

export function SleepReport({ records }: SleepReportProps) {
  const stats = useMemo(() => computeSleepStats(records), [records]);

  const trend = useMemo(
    () =>
      [...records]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date.slice(5), quality: r.quality })),
    [records]
  );

  const bedtimeTrend = useMemo(
    () =>
      [...records]
        .filter((r) => r.sleepTime)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date.slice(5), bedtime: timeToMinutes(r.sleepTime) })),
    [records]
  );

  const statItems = [
    { label: "平均入睡时间", value: stats.avgBedtime },
    { label: "平均时长", value: shortDuration(stats.avgDurationMinutes) },
    { label: "熬夜天数", value: `${stats.lateNightDays} 天` },
    { label: "作息规律度", value: `${stats.regularity} 分` },
  ];

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold">睡眠报告</p>

      <div className="grid grid-cols-4 gap-1.5">
        {statItems.map((it) => (
          <div key={it.label} className="rounded-lg border border-border px-1 py-1.5 text-center">
            <p className="text-[9px] leading-none text-muted-foreground sm:text-[11px]">
              {it.label}
            </p>
            <p className="mt-1 text-xs font-semibold tabular sm:text-sm">{it.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">睡眠质量趋势</p>
          {trend.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#71717A" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#71717A" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    name="质量"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs text-muted-foreground">入睡时间趋势</p>
          {bedtimeTrend.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bedtimeTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#71717A" />
                  <YAxis
                    domain={[0, 1440]}
                    tick={{ fontSize: 11 }}
                    stroke="#71717A"
                    tickFormatter={(v) => minutesToTime(Number(v))}
                  />
                  <Tooltip formatter={(value) => minutesToTime(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="bedtime"
                    name="入睡时间"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}