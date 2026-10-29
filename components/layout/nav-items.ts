import type { LucideIcon } from "lucide-react";
import { Dumbbell, Home, Settings, Sparkles, User, Utensils } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "看板", icon: Home },
  { href: "/skin", label: "护肤", icon: Sparkles },
  { href: "/training", label: "训练", icon: Dumbbell },
  { href: "/diet", label: "饮食", icon: Utensils },
  { href: "/profile", label: "我的", icon: User },
];

export const SIDEBAR_ITEMS: NavItem[] = [
  ...NAV_ITEMS,
  { href: "/settings", label: "设置", icon: Settings },
];