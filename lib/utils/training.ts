import type { TrainingAction } from "@/lib/types";

export function formatTrainingAction(a: TrainingAction): string {
  if (a.unit) return `${a.name}·${a.value ?? ""}${a.unit}`;
  const bits = [a.sets, a.reps].filter(Boolean);
  return bits.length ? `${a.name}·${bits.join("*")}` : a.name;
}