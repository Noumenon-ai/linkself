"use client";
import { useState } from "react";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false);

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <span className="text-3xl">&#x1F51E;</span>
        </div>
        <h2 className="text-xl font-bold text-white">Age Restricted Content</h2>
        <p className="mt-2 text-sm text-slate-400">
          This page may contain content not suitable for all audiences. You must be 18 or older to view.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => setVerified(true)}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
          >
            I am 18 or older — Enter
          </button>
          <a
            href="/"
            className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-slate-600 hover:text-white"
          >
            Leave
          </a>
        </div>
      </div>
    </div>
  );
}
