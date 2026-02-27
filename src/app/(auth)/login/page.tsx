"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
    <Card>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Sign In</Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">Sign up</Link>
      </p>
    </Card>
  );
}
