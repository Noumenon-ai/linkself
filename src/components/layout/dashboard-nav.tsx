"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link as LinkIcon, Palette, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links", icon: LinkIcon },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-56 flex-col gap-1 border-r border-slate-200 dark:border-slate-700 p-4 min-h-screen bg-white dark:bg-slate-800">
        <Link href="/" className="mb-6 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          LinkSelf
        </Link>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
