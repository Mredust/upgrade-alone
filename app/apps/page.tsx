import Link from "next/link";
import { Dumbbell, ListChecks, Moon, Sparkles, User, Utensils } from "lucide-react";

const APPS = [
  { href: "/skin", label: "护肤", desc: "记录每日护肤步骤", icon: Sparkles },
  { href: "/training", label: "训练", desc: "记录健身动作与部位", icon: Dumbbell },
  { href: "/diet", label: "饮食", desc: "记录每日三餐", icon: Utensils },
  { href: "/sleep", label: "睡眠", desc: "睡眠打卡与报告", icon: Moon },
  { href: "/records", label: "记录", desc: "每日事项打卡", icon: ListChecks },
  { href: "/profile", label: "我的", desc: "身体数据与 BMI 管理", icon: User },
];

export default function AppsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">应用</h1>
      <div className="grid grid-cols-2 gap-3">
        {APPS.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
          >
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}