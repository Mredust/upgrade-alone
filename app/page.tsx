"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, X } from "lucide-react";

import { Heatmap } from "@/components/dashboard/heatmap";
import { TrendChart } from "@/components/profile/trend-chart";
import { SleepReport } from "@/components/sleep/sleep-report";
import { Card } from "@/components/ui/card";
import { DAY_STEPS, NIGHT_STEPS } from "@/lib/constants/skin-steps";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useSleepStore } from "@/lib/store/use-sleep-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { todayKey } from "@/lib/utils/date";
import type { SkinRecord, TrainingRecord } from "@/lib/types";

const SKIN_DAY_KEYS = DAY_STEPS.map((s) => s.key);
const SKIN_NIGHT_KEYS = NIGHT_STEPS.map((s) => s.key);
// 兼容历史数据中的中文部位名「休息」
const REST_KEYS = new Set(["rest", "休息"]);

// 护肤：日间或夜间任意步骤有记录即算打卡；日、夜都为空则不算
function isSkinChecked(r: SkinRecord): boolean {
  const steps = r.steps ?? {};
  const hasDay = SKIN_DAY_KEYS.some((k) => (steps[k] ?? "").trim() !== "");
  const hasNight = SKIN_NIGHT_KEYS.some((k) => (steps[k] ?? "").trim() !== "");
  return hasDay || hasNight;
}

// 训练：有非「休息」部位才算打卡；空数组或仅休息不算
function isTrainingChecked(r: TrainingRecord): boolean {
  const parts = r.bodyParts ?? [];
  return parts.some((p) => !REST_KEYS.has(p));
}

interface CheckinCardProps {
  recordLabel: string;
  rateLabel: string;
  total: number;
  thisMonth: number;
  rate: string;
}

function CheckinCard({ recordLabel, rateLabel, total, thisMonth, rate }: CheckinCardProps) {
  return (
    <Card className="p-3 lg:p-4">
      <div className="grid grid-cols-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">{recordLabel}</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{total}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">本月</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{thisMonth}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground sm:text-xs">{rateLabel}</p>
          <p className="mt-1 text-base font-semibold tabular sm:text-xl">{rate}</p>
        </div>
      </div>
    </Card>
  );
}

interface TodoItem {
  label: string;
  done: boolean;
  href: string;
}

function TodoIcon({ done }: { done: boolean }) {
  return done ? (
    <Check className="h-5 w-5 text-success" />
  ) : (
    <X className="h-5 w-5 text-destructive" />
  );
}

function TodayTodoCard({ items }: { items: TodoItem[] }) {
  return (
    <Card className="p-3">
      <p className="text-sm font-semibold">今日待办</p>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {items.map((it) => {
          const body = (
            <div className="flex flex-col items-center gap-1">
              <TodoIcon done={it.done} />
              <span className="text-[10px] text-muted-foreground">{it.label}</span>
            </div>
          );
          // 未记录（错号）可点击跳转；已记录（对号）不跳转
          return it.done ? (
            <div key={it.label}>{body}</div>
          ) : (
            <Link key={it.label} href={it.href} className="transition-opacity hover:opacity-70">
              {body}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const skin = useSkinStore((s) => s.records);
  const training = useTrainingStore((s) => s.records);
  const sleepRecords = useSleepStore((s) => s.records);
  const dietRecords = useDietStore((s) => s.records);
  const isDesktop = useIsDesktop();

  const skinCheckedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of skin) if (isSkinChecked(r)) set.add(r.date);
    return set;
  }, [skin]);

  const trainingCheckedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of training) if (isTrainingChecked(r)) set.add(r.date);
    return set;
  }, [training]);

  // 今日待办：有当天记录即打勾（训练仅休息部位也算已记录）
  const today = todayKey();
  const todoItems: TodoItem[] = [
    { label: "护肤", done: skin.some((r) => r.date === today), href: "/skin" },
    { label: "训练", done: training.some((r) => r.date === today), href: "/training" },
    { label: "饮食", done: dietRecords.some((r) => r.date === today), href: "/diet" },
    { label: "睡眠", done: sleepRecords.some((r) => r.date === today), href: "/sleep" },
  ];

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const skinTotal = skinCheckedDates.size;
  const trainingTotal = trainingCheckedDates.size;

  const skinThisMonth = skin.filter(
    (r) => isSkinChecked(r) && r.date.startsWith(monthPrefix)
  ).length;
  const trainingThisMonth = training.filter(
    (r) => isTrainingChecked(r) && r.date.startsWith(monthPrefix)
  ).length;

  const skinRate = daysInMonth > 0 ? Math.round((skinThisMonth / daysInMonth) * 100) : 0;
  const trainingRate = daysInMonth > 0 ? Math.round((trainingThisMonth / daysInMonth) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 移动端：今日待办占一行 */}
      <div className="lg:hidden">
        <TodayTodoCard items={todoItems} />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
        <CheckinCard
          recordLabel="护肤记录"
          rateLabel="护肤率"
          total={skinTotal}
          thisMonth={skinThisMonth}
          rate={`${skinRate}%`}
        />
        <CheckinCard
          recordLabel="训练记录"
          rateLabel="训练率"
          total={trainingTotal}
          thisMonth={trainingThisMonth}
          rate={`${trainingRate}%`}
        />
        {/* PC 端：顶部右侧为今日待办 */}
        <div className="hidden lg:block">
          <TodayTodoCard items={todoItems} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <Heatmap
          title="护肤打卡"
          checkedDates={skinCheckedDates}
          mode={isDesktop ? "year" : "mobile"}
        />
        <Heatmap
          title="健身打卡"
          checkedDates={trainingCheckedDates}
          mode={isDesktop ? "year" : "mobile"}
        />
      </div>

      <SleepReport records={sleepRecords} />

      {!isDesktop && (
        <Card className="p-4">
          <p className="mb-3 text-sm font-semibold">BMI / 体重趋势</p>
          <TrendChart />
        </Card>
      )}
    </div>
  );
}