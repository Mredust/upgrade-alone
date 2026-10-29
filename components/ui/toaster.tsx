"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useToastStore } from "@/lib/store/use-toast-store";
import type { ToastType } from "@/lib/store/use-toast-store";
import { cn } from "@/lib/utils/cn";

const meta: Record<ToastType, { icon: typeof Info; accent: string }> = {
  success: { icon: CheckCircle2, accent: "text-success" },
  error: { icon: XCircle, accent: "text-destructive" },
  warning: { icon: AlertTriangle, accent: "text-warning" },
  info: { icon: Info, accent: "text-foreground" },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const { icon: Icon, accent } = meta[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg animate-fade-up"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", accent)} />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}