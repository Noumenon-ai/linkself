"use client";

import { useEffect, useState } from "react";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { apiFetch } from "@/lib/api-client";

interface ClickData {
  days: { date: string; clicks: number }[];
  byReferrer: { referrer: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  topLinks: { title: string; clicks: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<ClickData | null>(null);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

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

  const totalClicks = data?.days.reduce((s, d) => s + d.clicks, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Clicks Over Time</h2>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalClicks}</span>
        </div>
        {data && <AnalyticsChart data={data.days} />}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BreakdownTable title="Top Links" items={data?.topLinks?.map((l) => ({ label: l.title, count: l.clicks })) ?? []} />
        <BreakdownTable title="Referrers" items={data?.byReferrer?.map((r) => ({ label: r.referrer, count: r.count })) ?? []} />
        <BreakdownTable title="Devices" items={data?.byDevice?.map((d) => ({ label: d.device, count: d.count })) ?? []} />
        <BreakdownTable title="Countries" items={data?.byCountry?.map((c) => ({ label: c.country, count: c.count })) ?? []} />
      </div>
    </div>
  );
}

function BreakdownTable({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No data yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">{item.count}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(item.count / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
