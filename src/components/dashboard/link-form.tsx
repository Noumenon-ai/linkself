"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinkFormProps {
  onSave: (data: { title: string; url: string; icon: string }) => Promise<void>;
  initial?: { title: string; url: string; icon: string };
  onCancel?: () => void;
}

export function LinkForm({ onSave, initial, onCancel }: LinkFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave({ title, url, icon });
      if (!initial) { setTitle(""); setUrl(""); setIcon(""); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
        <Input label="Title" placeholder="My Website" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} type="url" required />
        <Input label="Icon" placeholder="emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>{initial ? "Update" : "Add Link"}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
