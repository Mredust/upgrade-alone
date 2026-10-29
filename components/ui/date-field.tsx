"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const ref = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = ref.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <div className="relative h-9 w-full" onClick={openPicker}>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div className="pointer-events-none flex h-full w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="tabular">{value || "选择日期"}</span>
      </div>
    </div>
  );
}