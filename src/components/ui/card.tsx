import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700", className)}
      {...props}
    >
      {children}
    </div>
  );
}
