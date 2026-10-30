"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectChangeEvent {
  target: { value: string };
}

interface SelectProps {
  value?: string | number;
  onChange?: (e: SelectChangeEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
}

// 从 <option value="x">label</option> 子元素中提取选项
function extractOptions(children: ReactNode): SelectOption[] {
  const opts: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === "option") {
      const props = child.props as { value?: string | number; children?: ReactNode };
      opts.push({
        value: String(props.value ?? ""),
        label: String(props.children ?? ""),
      });
    }
  });
  return opts;
}

export function Select({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  children,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = extractOptions(children);
  const selected = options.find((o) => o.value === String(value ?? "")) ?? null;
  const placeholderLabel =
    placeholder ?? options.find((o) => o.value === "")?.label ?? "请选择";
  const visibleOptions = options.filter((o) => o.value !== "");

  return (
    <div ref={ref} className={cn("relative h-9", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-full w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selected?.label ?? placeholderLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {visibleOptions.map((opt) => {
            const active = opt.value === String(value ?? "");
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange?.({ target: { value: opt.value } });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
                  active && "bg-muted font-medium"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}