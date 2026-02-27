"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { apiFetch } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";
import { getAnalyticsPeriods } from "@/lib/plans";

interface ClickData {
  days: { date: string; clicks: number }[];
  byReferrer: { referrer: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  topLinks: { title: string; clicks: number }[];
  summary: {
    totalClicks: number;
    avgClicksPerDay: number;
    bestDay: { date: string; clicks: number } | null;
    ctr: number;
  };
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

const PERIODS = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<ClickData | null>(null);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [allowedPeriods, setAllowedPeriods] = useState<string[]>(["7d"]);

  // Load plan info
  useEffect(() => {
    apiFetch<Record<string, string | null>>("/api/settings")
      .then((settings) => {
        const planId = settings.plan || "free";
        setUserPlan(planId);
        setAllowedPeriods(getAnalyticsPeriods(planId));
      })
      .catch(() => { /* use defaults */ });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch<ClickData>(`/api/analytics/clicks?period=${period}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  const summary = data?.summary;
  const bestDayFormatted = summary?.bestDay
    ? new Date(summary.bestDay.date + "T12:00:00").toLocaleDateString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const maxTopLinkClicks = Math.max(...(data?.topLinks?.map((l) => l.clicks) ?? [0]), 1);

  return (
    <div className="space-y-6">
      {/* Header + Pill Tab Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Detailed performance insights for your links
          </p>
        </div>
        {/* Pill tab selector */}
        <div className="flex rounded-full bg-slate-100 dark:bg-slate-700/50 p-1 gap-0.5">
          {PERIODS.map((p) => {
            const isAllowed = allowedPeriods.includes(p.key);
            const requiredPlan = p.key === "90d" ? "Business" : p.key === "30d" ? "Pro" : null;
            return (
              <button
                key={p.key}
                onClick={() => { if (isAllowed) setPeriod(p.key); }}
                disabled={!isAllowed}
                title={!isAllowed && requiredPlan ? `Requires ${requiredPlan} plan` : undefined}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  !isAllowed
                    ? "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : period === p.key
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {p.label}
                {!isAllowed && <Lock className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Bar: 4 accent cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Clicks"
          value={formatNumber(summary?.totalClicks ?? 0)}
          accent="indigo"
          icon={"\u{1F5B1}\u{FE0F}"}
        />
        <SummaryCard
          label="Avg / Day"
          value={`${summary?.avgClicksPerDay ?? 0}`}
          accent="cyan"
          icon={"\u{1F4C8}"}
        />
        <SummaryCard
          label="Clicks / Link"
          value={`${summary?.ctr ?? 0}`}
          accent="emerald"
          icon={"\u{1F4CA}"}
        />
        <SummaryCard
          label="Best Day"
          value={bestDayFormatted}
          subValue={summary?.bestDay ? `${summary.bestDay.clicks} clicks` : undefined}
          accent="amber"
          icon={"\u{1F3C6}"}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Clicks Over Time</h2>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatNumber(summary?.totalClicks ?? 0)}
          </span>
        </div>
        {data && <AnalyticsChart data={data.days} />}
      </div>

      {/* Top Links -- visual bar chart with gradient bars */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900 dark:text-white">Top Links</h2>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            {data?.topLinks?.length ?? 0} links
          </span>
        </div>
        {(data?.topLinks?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No click data yet</p>
        ) : (
          <div className="space-y-4">
            {data?.topLinks?.map((link, i) => {
              const widthPct = Math.max((link.clicks / maxTopLinkClicks) * 100, 3);
              const barColors = [
                "from-indigo-500 to-indigo-400",
                "from-cyan-500 to-cyan-400",
                "from-emerald-500 to-emerald-400",
                "from-amber-500 to-amber-400",
                "from-violet-500 to-violet-400",
                "from-rose-500 to-rose-400",
                "from-sky-500 to-sky-400",
                "from-teal-500 to-teal-400",
                "from-orange-500 to-orange-400",
                "from-pink-500 to-pink-400",
              ];
              const dotColors = [
                "bg-indigo-500",
                "bg-cyan-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-violet-500",
                "bg-rose-500",
                "bg-sky-500",
                "bg-teal-500",
                "bg-orange-500",
                "bg-pink-500",
              ];
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[60%] font-medium flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-normal w-5 shrink-0">{i + 1}.</span>
                      {link.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                      {formatNumber(link.clicks)} clicks
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColors[i % barColors.length]} transition-all duration-700 group-hover:brightness-110`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown Cards: referrers, devices, countries with percentage bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownCard
          title="Referrers"
          icon={"\u{1F517}"}
          items={data?.byReferrer?.map((r) => ({ label: r.referrer, count: r.count })) ?? []}
          accentColor="cyan"
        />
        <BreakdownCard
          title="Devices"
          icon={"\u{1F4F1}"}
          items={data?.byDevice?.map((d) => ({
            label: d.device,
            count: d.count,
            icon: deviceIcon(d.device),
          })) ?? []}
          accentColor="emerald"
        />
        <BreakdownCard
          title="Countries"
          icon={"\u{1F30D}"}
          items={data?.byCountry?.map((c) => ({
            label: c.country,
            count: c.count,
            icon: countryFlag(c.country),
          })) ?? []}
          accentColor="violet"
        />
      </div>
    </div>
  );
}

// --- Summary Card Component ---
function SummaryCard({
  label,
  value,
  subValue,
  accent,
  icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  accent: "indigo" | "cyan" | "emerald" | "amber";
  icon: string;
}) {
  const accentMap = {
    indigo: "border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5",
    cyan: "border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5",
    emerald: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5",
    amber: "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5",
  };
  const textMap = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 ${accentMap[accent]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${textMap[accent]}`}>
          {label}
        </p>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subValue && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

// --- Breakdown Card Component with percentage bars ---
function BreakdownCard({
  title,
  icon,
  items,
  accentColor,
}: {
  title: string;
  icon: string;
  items: { label: string; count: number; icon?: string }[];
  accentColor: "cyan" | "emerald" | "violet";
}) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  const barColorMap = {
    cyan: "from-cyan-500 to-cyan-400",
    emerald: "from-emerald-500 to-emerald-400",
    violet: "from-violet-500 to-violet-400",
  };
  const headerBgMap = {
    cyan: "from-cyan-500/10 to-transparent",
    emerald: "from-emerald-500/10 to-transparent",
    violet: "from-violet-500/10 to-transparent",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Header with subtle gradient */}
      <div className={`flex items-center gap-2 p-5 pb-4 bg-gradient-to-r ${headerBgMap[accentColor]}`}>
        <span className="text-base">{icon}</span>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-5 pb-5">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No data yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[50%] flex items-center gap-1.5">
                      {item.icon && <span className="text-xs shrink-0">{item.icon}</span>}
                      {item.label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{item.count}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right tabular-nums">
                        {pct}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColorMap[accentColor]} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
