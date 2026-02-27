"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { apiFetch } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

interface RecentClick {
  link_title: string;
  referrer: string;
  country: string;
  device: string;
  created_at: string;
}

interface TopLinkItem {
  title: string;
  clicks: number;
}

interface QuickStat {
  referrer: string;
  count: number;
}

interface QuickStatCountry {
  country: string;
  count: number;
}

interface QuickStatDevice {
  device: string;
  count: number;
}

interface DayClick {
  date: string;
  clicks: number;
}

interface Overview {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksTrend: number;
  viewsToday: number;
  viewsThisWeek: number;
  uniqueVisitors: number;
  ctr: number;
  topLink: { title: string; clicks: number } | null;
  topReferrer: QuickStat | null;
  topCountry: QuickStatCountry | null;
  topDevice: QuickStatDevice | null;
  dailyClicks: DayClick[];
  topLinks: TopLinkItem[];
  recentClicks: RecentClick[];
}

// Country code to flag emoji
function countryFlag(code: string): string {
  if (!code || code === "Unknown" || code.length !== 2) return "\u{1F30D}";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...Array.from(upper).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// Device icon
function deviceIcon(device: string): string {
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("phone")) return "\u{1F4F1}";
  if (d.includes("tablet") || d.includes("ipad")) return "\u{1F4DF}";
  return "\u{1F5A5}\u{FE0F}";
}

// Time ago helper
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Overview>("/api/analytics/overview")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  const maxDailyClicks = Math.max(...(data?.dailyClicks?.map((d) => d.clicks) ?? [0]), 1);
  const maxTopLinkClicks = Math.max(...(data?.topLinks?.map((l) => l.clicks) ?? [0]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your link performance at a glance
          </p>
        </div>
        <a
          href="/dashboard/analytics"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          View full analytics &rarr;
        </a>
      </div>

      {/* Row 1: 4 Metric Cards with colored accents and trend arrows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Clicks"
          value={formatNumber(data?.totalClicks ?? 0)}
          subtitle="all time"
          trend={data?.clicksTrend ?? null}
          accent="cyan"
          icon={"\u{1F5B1}\u{FE0F}"}
        />
        <StatsCard
          label="Clicks Today"
          value={formatNumber(data?.clicksToday ?? 0)}
          subtitle="since midnight"
          accent="emerald"
          icon={"\u{26A1}"}
        />
        <StatsCard
          label="This Week"
          value={formatNumber(data?.clicksThisWeek ?? 0)}
          subtitle="last 7 days"
          trend={data?.clicksTrend ?? null}
          accent="amber"
          icon={"\u{1F4C8}"}
        />
        <StatsCard
          label="Top Link"
          value={formatNumber(data?.topLink?.clicks ?? 0)}
          subtitle={data?.topLink?.title ?? "No links yet"}
          accent="violet"
          icon={"\u{1F451}"}
        />
      </div>

      {/* Row 2: Two columns -- Sparkline Bar Chart + Top 5 Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-day sparkline bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Clicks This Week</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily breakdown</p>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(data?.clicksThisWeek ?? 0)}
            </span>
          </div>
          <div className="flex items-end gap-2" style={{ height: 130 }}>
            {data?.dailyClicks?.map((day, idx) => {
              const heightPct = Math.max((day.clicks / maxDailyClicks) * 100, 4);
              const dayLabel = new Date(day.date + "T12:00:00").toLocaleDateString("en", { weekday: "short" });
              // Gradient intensity based on position
              const isToday = idx === (data?.dailyClicks?.length ?? 1) - 1;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-600 z-10">
                      {day.clicks}
                    </span>
                    <div
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                        isToday
                          ? "bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/20"
                          : "bg-gradient-to-t from-indigo-500/80 to-indigo-400/60 hover:from-indigo-600 hover:to-indigo-400"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Performing Links with progress bars */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Top Performing Links</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">This week</span>
          </div>
          {(data?.topLinks?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">No click data yet</p>
          ) : (
            <div className="space-y-3.5">
              {data?.topLinks?.slice(0, 5).map((link, i) => {
                const widthPct = Math.max((link.clicks / maxTopLinkClicks) * 100, 4);
                const gradients = [
                  "from-indigo-500 to-indigo-400",
                  "from-cyan-500 to-cyan-400",
                  "from-emerald-500 to-emerald-400",
                  "from-amber-500 to-amber-400",
                  "from-violet-500 to-violet-400",
                ];
                const dotColors = [
                  "bg-indigo-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-violet-500",
                ];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[65%] flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
                        {link.title}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                        {formatNumber(link.clicks)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradients[i % gradients.length]} transition-all duration-700`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: 3 Quick Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Referrer */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 text-cyan-600 dark:text-cyan-400 text-sm font-bold">
              {"\u{1F517}"}
            </span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Top Referrer</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {data?.topReferrer?.referrer ?? "No data"}
          </p>
          {data?.topReferrer && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatNumber(data.topReferrer.count)} clicks this week
            </p>
          )}
        </div>

        {/* Top Country */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 text-lg">
              {countryFlag(data?.topCountry?.country ?? "")}
            </span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Top Country</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {data?.topCountry?.country ?? "No data"}
          </p>
          {data?.topCountry && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatNumber(data.topCountry.count)} clicks this week
            </p>
          )}
        </div>

        {/* Top Device */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-violet-600/5 text-lg">
              {deviceIcon(data?.topDevice?.device ?? "")}
            </span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Top Device</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {data?.topDevice?.device ?? "No data"}
          </p>
          {data?.topDevice && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatNumber(data.topDevice.count)} clicks this week
            </p>
          )}
        </div>
      </div>

      {/* Row 4: Recent Activity Feed */}
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            Last 10 clicks
          </span>
        </div>
        {(data?.recentClicks?.length ?? 0) === 0 ? (
          <div className="px-5 pb-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {data?.recentClicks?.map((click, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Device icon */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-sm">
                  {deviceIcon(click.device)}
                </span>

                {/* Link title + meta */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {click.link_title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>{click.referrer || "Direct"}</span>
                    {click.country && click.country !== "Unknown" && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span>{countryFlag(click.country)} {click.country}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Time ago */}
                <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {timeAgo(click.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty state for no links */}
      {data?.totalLinks === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <div className="text-4xl mb-3">{"\u{1F517}"}</div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">No links yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Head to the{" "}
            <a
              href="/dashboard/links"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Links
            </a>{" "}
            page to add your first one.
          </p>
        </div>
      )}
    </div>
  );
}
