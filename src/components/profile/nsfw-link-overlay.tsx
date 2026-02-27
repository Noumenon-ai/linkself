"use client";
import { useState } from "react";

interface NsfwLinkOverlayProps {
  children: React.ReactNode;
}

export function NsfwLinkOverlay({ children }: NsfwLinkOverlayProps) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">18+ Content</span>
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-all hover:bg-slate-100"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
