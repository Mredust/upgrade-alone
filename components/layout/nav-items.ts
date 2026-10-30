import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Home,
  LayoutGrid,
  ListChecks,
  Moon,
  Settings,
  Sparkles,
  User,
  Utensils,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// 移动端底部 tabbar
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "看板", icon: Home },
  { href: "/apps", label: "应用", icon: LayoutGrid },
  { href: "/settings", label: "设置", icon: Settings },
];

// PC 端侧边栏
export const SIDEBAR_ITEMS: NavItem[] = [
  { href: "/", label: "看板", icon: Home },
  { href: "/skin", label: "护肤", icon: Sparkles },
  { href: "/training", label: "训练", icon: Dumbbell },
  { href: "/diet", label: "饮食", icon: Utensils },
  { href: "/sleep", label: "睡眠", icon: Moon },
  { href: "/records", label: "记录", icon: ListChecks },
  { href: "/profile", label: "我的", icon: User },
  { href: "/settings", label: "设置", icon: Settings },
];