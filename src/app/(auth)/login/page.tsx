"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      const isSuccess = data.status ? data.status === "success" : data.ok;
      if (!res.ok || !isSuccess) {
        const message = typeof data.error === "string" ? data.error : data.error?.message;
        setError(message ?? "Login failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Sign in to manage your links and see your analytics.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Email or Username"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="you@email.com or username"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        <Button
          type="submit"
          loading={loading}
          className="w-full !rounded-xl !py-3 !bg-gradient-to-r !from-cyan-500 !to-violet-600 hover:!shadow-lg hover:!shadow-cyan-500/25 !transition-all !duration-300 hover:!-translate-y-0.5"
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm px-3 text-slate-400 dark:text-slate-500">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Chrome className="h-4 w-4" />
          Google
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="h-4 w-4" />
          Email Link
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}
