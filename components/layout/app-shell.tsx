"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <span className="text-sm font-semibold">Upgrade Alone</span>
          <Link
            href="/settings"
            aria-label="设置"
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}