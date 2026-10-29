import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { HydrationProvider } from "@/components/providers/hydration-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upgrade Alone · 个人管理",
  description: "护肤 · 训练 · 饮食 · 身体数据记录",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <HydrationProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </HydrationProvider>
      </body>
    </html>
  );
}