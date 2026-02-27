"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, email, password }),
      });
      const data = await res.json();
      const isSuccess = data.status ? data.status === "success" : data.ok;
      if (!res.ok || !isSuccess) {
        const message = typeof data.error === "string" ? data.error : data.error?.message;
        setError(message ?? "Registration failed");
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
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Create your page</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Claim your unique link</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            required
            autoFocus
            placeholder="yourname"
          />
          {username && (
            <p className="mt-1 text-xs text-slate-500">
              Your page: <span className="font-mono text-indigo-500">linkself.com/{username}</span>
            </p>
          )}
        </div>
        <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="John Doe" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required hint="At least 8 characters" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Create Account</Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">Sign in</Link>
      </p>
    </Card>
  );
}
