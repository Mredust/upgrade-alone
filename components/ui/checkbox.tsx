"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 text-left transition-opacity disabled:opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}