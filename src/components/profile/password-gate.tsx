"use client";

import { useState, useEffect, type ReactNode } from "react";

interface PasswordGateProps {
  password: string;
  children: ReactNode;
}

export function PasswordGate({ password, children }: PasswordGateProps) {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check sessionStorage on mount to see if already unlocked
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("linkself_page_unlock");
      if (stored === password) {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage not available
    }
    setChecking(false);
  }, [password]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === password) {
      setUnlocked(true);
      setError(false);
      try {
        sessionStorage.setItem("linkself_page_unlock", password);
      } catch {
        // sessionStorage not available
      }
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
              <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">This page is protected</h2>
            <p className="text-sm text-slate-400">Enter the password to view this profile</p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Password"
              autoFocus
              className={`block w-full rounded-lg border px-4 py-3 text-sm text-white placeholder:text-slate-500 bg-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-600 focus:ring-indigo-500/30 focus:border-indigo-500"
              }`}
            />
            {error && (
              <p className="text-xs text-red-400">Incorrect password. Please try again.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!input}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
