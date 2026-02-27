"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links", icon: LinkIcon },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardNav({ username }: { username?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-3 mb-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <LinkIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white">
          Link<span className="gradient-text">Self</span>
        </span>
      </Link>

      {/* User profile card */}
      {username && (
        <div className="mx-2 mb-6 mt-4 rounded-xl bg-white/[0.06] border border-white/[0.06] p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {username}
            </p>
            <p className="text-xs text-slate-400 truncate">
              linkself.com/{username}
            </p>
          </div>
        </div>
      )}

      {/* Nav items */}
      <div className="space-y-1 flex-1 px-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-cyan-300 border-l-[3px] border-cyan-400 ml-0 pl-[9px]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white border-l-[3px] border-transparent ml-0 pl-[9px]"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", active ? "text-cyan-400" : "")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* View My Page link */}
      {username && (
        <div className="px-1">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 border-l-[3px] border-transparent pl-[9px]"
          >
            <ExternalLink className="h-[18px] w-[18px] flex-shrink-0" />
            View My Page
          </a>
        </div>
      )}

      {/* Bottom section */}
      <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-1 px-1">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px] pl-[9px]",
            pathname === "/dashboard/settings"
              ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-cyan-300 border-cyan-400"
              : "text-slate-400 hover:bg-white/[0.06] hover:text-white border-transparent"
          )}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          Settings
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border-l-[3px] border-transparent pl-[9px]"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-60 flex-col gap-1 border-r border-white/[0.06] p-4 min-h-screen bg-slate-900">
        {navContent}
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-slate-800 active:scale-95"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-slate-300" />
        ) : (
          <Menu className="h-5 w-5 text-slate-300" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <nav
        className={cn(
          "md:hidden fixed top-0 left-0 z-40 h-full w-72 flex flex-col gap-1 border-r border-white/[0.06] p-4 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </nav>
    </>
  );
}
