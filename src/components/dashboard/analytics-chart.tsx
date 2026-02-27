"use client";

interface DayData {
  date: string;
  clicks: number;
}

interface AnalyticsChartProps {
  data: DayData[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const max = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 192 }}>
      {data.map((day) => {
        const heightPx = Math.max((day.clicks / max) * 160, 3);
        const label = new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" });
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex justify-center">
              <span className="absolute -top-6 text-xs font-medium text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {day.clicks}
              </span>
              <div
                className="w-full max-w-[32px] rounded-t-md bg-indigo-500 hover:bg-indigo-600 transition-colors"
                style={{ height: `${heightPx}px` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
