"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PLATFORMS = [
  "github", "twitter", "instagram", "youtube", "linkedin",
  "tiktok", "discord", "email", "website",
];

interface SocialIconFormProps {
  onSave: (data: { platform: string; url: string }) => Promise<void>;
}

export function SocialIconForm({ onSave }: SocialIconFormProps) {
  const [platform, setPlatform] = useState("github");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ platform, url });
      setUrl("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="block rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-white"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <Input label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} type="url" required />
      </div>
      <Button type="submit" loading={loading}>Add</Button>
    </form>
  );
}
