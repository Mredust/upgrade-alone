export function calcBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg) return undefined;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(bmi: number): { label: string; className: string } {
  if (bmi < 18.5) return { label: "偏瘦", className: "text-warning" };
  if (bmi < 24) return { label: "正常", className: "text-success" };
  if (bmi < 28) return { label: "超重", className: "text-warning" };
  return { label: "肥胖", className: "text-destructive" };
}