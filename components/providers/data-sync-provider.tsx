"use client";

import { useEffect, useState } from "react";

import { fetchAllRecords } from "@/lib/actions/records";
import { useBodyStore } from "@/lib/store/use-body-store";
import { useDietStore } from "@/lib/store/use-diet-store";
import { useSkinStore } from "@/lib/store/use-skin-store";
import { useTrainingStore } from "@/lib/store/use-training-store";
import { toast } from "@/lib/store/use-toast-store";

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAllRecords()
      .then((data) => {
        if (cancelled) return;
        useBodyStore.getState().setMeasures(data.body);
        useDietStore.getState().setRecords(data.diet);
        useSkinStore.getState().setRecords(data.skin);
        useTrainingStore.getState().setRecords(data.training);
      })
      .catch(() => {
        if (!cancelled) toast("无法连接云端数据库，已使用本地缓存", "warning");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}