import { cn } from "@/lib/cn";

type AccentColor = "cyan" | "emerald" | "amber" | "violet" | "indigo" | "rose" | "default";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number | null;
  accent?: AccentColor;
  icon?: string;
  className?: string;
}

const accentStyles: Record<AccentColor, { border: string; bg: string; text: string; trendUp: string; trendDown: string }> = {
  cyan: {
    border: "border-cyan-500/20",
    bg: "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/10 dark:to-cyan-600/5",
    text: "text-cyan-600 dark:text-cyan-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/10 dark:to-emerald-600/5",
    text: "text-emerald-600 dark:text-emerald-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/10 dark:to-amber-600/5",
    text: "text-amber-600 dark:text-amber-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  violet: {
    border: "border-violet-500/20",
    bg: "bg-gradient-to-br from-violet-500/10 to-violet-600/5 dark:from-violet-500/10 dark:to-violet-600/5",
    text: "text-violet-600 dark:text-violet-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  indigo: {
    border: "border-indigo-500/20",
    bg: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/10 dark:to-indigo-600/5",
    text: "text-indigo-600 dark:text-indigo-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  rose: {
    border: "border-rose-500/20",
    bg: "bg-gradient-to-br from-rose-500/10 to-rose-600/5 dark:from-rose-500/10 dark:to-rose-600/5",
    text: "text-rose-600 dark:text-rose-400",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
  default: {
    border: "border-slate-200 dark:border-slate-700",
    bg: "bg-white dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
    trendUp: "text-emerald-500",
    trendDown: "text-rose-500",
  },
};

export function StatsCard({ label, value, subtitle, trend, accent = "default", icon, className }: StatsCardProps) {
  const style = accentStyles[accent];
  const hasTrend = trend !== undefined && trend !== null;
  const trendUp = hasTrend && trend >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        style.border,
        style.bg,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-medium", style.text)}>{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {hasTrend && (
          <span
            className={cn(
              "mb-0.5 flex items-center gap-0.5 text-xs font-semibold",
              trendUp ? style.trendUp : style.trendDown
            )}
          >
            <svg
              className={cn("h-3 w-3", !trendUp && "rotate-180")}
              fill="none"
              viewBox="0 0 12 12"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3m0 0L3 6m3-3l3 3" />
            </svg>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
