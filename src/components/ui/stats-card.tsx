import { cn } from "@/lib/cn";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function StatsCard({ label, value, subtitle, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700", className)}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
