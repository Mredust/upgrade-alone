import type { SleepRecord } from "@/lib/types";

// 熬夜判定基准线（系统内置）
export const BEDTIME_BASELINE = "23:00";

// "HH:mm" -> 分钟数；非法输入返回 0
export function timeToMinutes(t: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

// 分钟数 -> "HH:mm"（自动对 24h 取模）
export function minutesToTime(min: number): string {
  const m = ((Math.round(min) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// 入睡时间趋势坐标：以 00:00 为坐标中心，上半部分为 00:00-12:00（上午），
// 下半部分为 12:00-24:00（下午/晚上），避免 23:00 与 00:00 在图上被拉成最大跨度。
export function bedtimeChartValue(t: string): number {
  const m = timeToMinutes(t);
  return m <= 12 * 60 ? m : m - 24 * 60;
}

export const BEDTIME_CHART_TICKS = [-12 * 60, -6 * 60, 0, 6 * 60, 12 * 60];

// 归一化到“当天晚上”：早于 12:00 视为跨天凌晨，+24h（用于比较入睡先后）
function normalizeMinutes(t: string): number {
  const m = timeToMinutes(t);
  return m < 12 * 60 ? m + 24 * 60 : m;
}

// 日期 + "HH:mm" -> 本地时间；非法输入返回 null
function toDateTime(date: string, t: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  if (!date || !m) return null;
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}

// 睡眠时间窗：入睡时间为所选日期，起床时间默认为日期次日；
// 若起床时间晚于入睡时间（如 01:00 入睡、08:00 起床），则按同一天处理。
export function sleepWindow(
  date: string,
  sleepTime: string,
  wakeTime: string
): { start: Date; wake: Date } | null {
  const start = toDateTime(date, sleepTime);
  const wake = toDateTime(date, wakeTime);
  if (!start || !wake) return null;
  if (wake <= start) wake.setDate(wake.getDate() + 1);
  return { start, wake };
}

// 夜间睡眠分钟数（例：2026-11-11 23:00 入睡 → 2026-11-12 07:00 起床 = 480 分钟）
export function calcNightMinutes(date: string, sleepTime: string, wakeTime: string): number {
  const win = sleepWindow(date, sleepTime, wakeTime);
  if (!win) return 0;
  return Math.round((win.wake.getTime() - win.start.getTime()) / 60000);
}

// 总睡眠分钟数（传入完整记录）= 夜间 + 午睡
export function calcTotalMinutes(r: SleepRecord): number {
  return calcNightMinutes(r.date, r.sleepTime, r.wakeTime) + (r.napMinutes || 0);
}

// 总睡眠分钟数（直接传入日期、时间与午睡）
export function calcTotalDuration(
  date: string,
  sleepTime: string,
  wakeTime: string,
  napMinutes: number
): number {
  return calcNightMinutes(date, sleepTime, wakeTime) + (napMinutes || 0);
}

export function formatDuration(min: number): string {
  if (!min || min <= 0) return "0分钟";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
}

// 是否熬夜：入睡时间超过基准线（入睡在凌晨也视为更晚）
export function isLateNight(sleepTime: string): boolean {
  if (!sleepTime) return false;
  return normalizeMinutes(sleepTime) > normalizeMinutes(BEDTIME_BASELINE);
}

// 睡眠时长得分（0-60）
function scoreDuration(minutes: number): number {
  if (minutes >= 420 && minutes <= 540) return 60; // 7~9 小时
  if ((minutes >= 360 && minutes < 420) || (minutes > 540 && minutes <= 600)) return 40; // 6~7 或 9~10
  if ((minutes >= 300 && minutes < 360) || (minutes > 600 && minutes <= 660)) return 20; // 5~6 或 10~11
  return 0; // <5 小时 或 >11 小时
}

// 熬夜得分（0-40），基于系统内置基准线 23:00
function scoreLateNight(sleepTime: string): number {
  if (!sleepTime) return 0;
  const st = normalizeMinutes(sleepTime);
  const base = normalizeMinutes(BEDTIME_BASELINE);
  if (st <= base) return 40; // 23:00 之前
  if (st <= base + 60) return 30; // 23:00 ~ 00:00
  if (st <= base + 120) return 20; // 00:00 ~ 01:00
  if (st <= base + 180) return 10; // 01:00 ~ 02:00
  return 0; // 02:00 之后
}

// 睡眠质量系统评分（0-100）= 时长得分(60) + 熬夜得分(40)
// 时长按「入睡日期 → 日期次日」计算，例如 11-11 23:00 入睡、11-12 07:00 起床 = 8 小时
export function scoreSleepQuality(
  date: string,
  sleepTime: string,
  wakeTime: string,
  napMinutes: number
): number {
  return (
    scoreDuration(calcTotalDuration(date, sleepTime, wakeTime, napMinutes)) +
    scoreLateNight(sleepTime)
  );
}

export interface SleepStats {
  avgBedtime: string; // 平均入睡时间 HH:mm
  avgDurationMinutes: number; // 平均总睡眠时长（分钟）
  lateNightDays: number; // 熬夜天数
  regularity: number; // 作息规律度 0-100（入睡时间标准差）
}

export function computeSleepStats(records: SleepRecord[]): SleepStats {
  const withTime = records.filter((r) => r.sleepTime && r.wakeTime);

  let avgBedtime = "—";
  let avgDurationMinutes = 0;
  let stdDevMinutes = 0;

  if (withTime.length > 0) {
    const bedtimes = withTime.map((r) => normalizeMinutes(r.sleepTime));
    const durations = withTime.map((r) => calcTotalMinutes(r));
    const avgB = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    avgBedtime = minutesToTime(avgB);
    avgDurationMinutes = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const variance = bedtimes.reduce((a, b) => a + (b - avgB) ** 2, 0) / bedtimes.length;
    stdDevMinutes = Math.sqrt(variance);
  }

  const lateNightDays = records.filter((r) => isLateNight(r.sleepTime)).length;
  // 标准差越大越不规律；每 1 分钟标准差扣 1.5 分，最低 0 分
  const regularity = withTime.length > 0 ? Math.max(0, Math.round(100 - stdDevMinutes * 1.5)) : 0;

  return { avgBedtime, avgDurationMinutes, lateNightDays, regularity };
}

// 睡眠质量评级（0-100 → S/A/B/C）及对应颜色
export type SleepGrade = "S" | "A" | "B" | "C";

export const SLEEP_GRADE_COLOR: Record<SleepGrade, string> = {
  S: "#22C55E",
  A: "#3B82F6",
  B: "#F59E0B",
  C: "#EF4444",
};

export function sleepGrade(quality: number): SleepGrade {
  if (quality >= 85) return "S";
  if (quality >= 70) return "A";
  if (quality >= 50) return "B";
  return "C";
}