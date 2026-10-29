"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useBodyStore } from "@/lib/store/use-body-store";
import { calcBmi } from "@/lib/utils/bmi";

export function TrendChart() {
  const measures = useBodyStore((s) => s.measures);

  const data = useMemo(() => {
    return measures
      .filter((m) => m.weight !== undefined)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({
        date: m.date.slice(5),
        weight: m.weight,
        bmi: calcBmi(m.height, m.weight),
      }))
      .filter((d) => d.bmi !== undefined);
  }, [measures]);

  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded border border-border text-sm text-muted-foreground">
        暂无身体数据，添加记录后显示趋势
      </div>
    );
  }

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#71717A" />
          <YAxis yAxisId="weight" tick={{ fontSize: 11 }} stroke="#71717A" domain={["auto", "auto"]} />
          <YAxis
            yAxisId="bmi"
            orientation="right"
            tick={{ fontSize: 11 }}
            stroke="#71717A"
            domain={["auto", "auto"]}
          />
          <Tooltip formatter={(value) => (typeof value === "number" ? value.toFixed(2) : String(value))} />
          <Legend />
          <Line
            yAxisId="weight"
            type="linear"
            dataKey="weight"
            name="体重(kg)"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          <Line
            yAxisId="bmi"
            type="linear"
            dataKey="bmi"
            name="BMI"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}