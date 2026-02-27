"use client";

import type { Theme } from "@/lib/themes";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface ThemeCardProps {
  theme: Theme;
  selected: boolean;
  onClick: () => void;
}

export function ThemeCard({ theme, selected, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:scale-[1.02]",
        selected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-700"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      {/* Theme preview */}
      <div
        className="w-full h-24 rounded-lg flex flex-col items-center justify-center gap-1.5 p-3"
        style={{ backgroundColor: theme.preview.bg }}
      >
        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: theme.preview.card }} />
        <div className="h-2 w-16 rounded-full" style={{ backgroundColor: theme.preview.text }} />
        <div className="h-5 w-24 rounded-md" style={{ backgroundColor: theme.preview.card }} />
        <div className="h-5 w-24 rounded-md opacity-70" style={{ backgroundColor: theme.preview.card }} />
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{theme.name}</span>
    </button>
  );
}
