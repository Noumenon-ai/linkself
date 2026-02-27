"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { apiFetch } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

interface Overview {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  topLink: { title: string; clicks: number } | null;
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Links" value={data?.totalLinks ?? 0} />
        <StatsCard label="Total Clicks" value={formatNumber(data?.totalClicks ?? 0)} />
        <StatsCard label="Today" value={data?.clicksToday ?? 0} subtitle="clicks" />
        <StatsCard label="This Week" value={data?.clicksThisWeek ?? 0} subtitle="clicks" />
      </div>

      {data?.topLink && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Top Performing Link</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{data.topLink.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{formatNumber(data.topLink.clicks)} clicks</p>
        </div>
      )}

      {data?.totalLinks === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="text-slate-600 dark:text-slate-300">No links yet. Head to the <a href="/dashboard/links" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Links</a> page to add your first one.</p>
        </div>
      )}
    </div>
  );
}
