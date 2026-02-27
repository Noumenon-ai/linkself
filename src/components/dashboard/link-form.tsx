"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LinkType = "link" | "header" | "divider" | "embed";

export interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  link_type?: LinkType;
  embed_url?: string;
  nsfw?: boolean;
}

interface LinkFormProps {
  onSave: (data: LinkFormData) => Promise<void>;
  initial?: { title: string; url: string; icon: string; link_type?: string; embed_url?: string; nsfw?: boolean };
  onCancel?: () => void;
  linkType?: LinkType;
}

function detectEmbedPlatform(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) return "YouTube";
  if (url.includes("open.spotify.com/")) return "Spotify";
  return "Generic";
}

export function LinkForm({ onSave, initial, onCancel, linkType: forcedType }: LinkFormProps) {
  const effectiveType = forcedType ?? (initial?.link_type as LinkType) ?? "link";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [embedUrl, setEmbedUrl] = useState(initial?.embed_url ?? "");
  const [nsfw, setNsfw] = useState(initial?.nsfw ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const platform = effectiveType === "embed" ? detectEmbedPlatform(embedUrl) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data: LinkFormData = {
        title: effectiveType === "divider" ? "---" : title,
        url: effectiveType === "header" || effectiveType === "divider" ? "" : url,
        icon,
        link_type: effectiveType,
        nsfw,
      };
      if (effectiveType === "embed") {
        data.embed_url = embedUrl;
        data.url = embedUrl || "";
      }
      await onSave(data);
      if (!initial) {
        setTitle("");
        setUrl("");
        setIcon("");
        setEmbedUrl("");
        setNsfw(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const typeLabels: Record<LinkType, string> = {
    link: "Link",
    header: "Header",
    divider: "Divider",
    embed: "Embed",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {effectiveType === "divider" ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">This will add a horizontal divider line between your links.</p>
      ) : effectiveType === "header" ? (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <Input label="Section Title" placeholder="My Projects" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Icon" placeholder="emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
        </div>
      ) : effectiveType === "embed" ? (
        <div className="space-y-3">
          <Input label="Title" placeholder="My Video" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Embed URL" placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..." value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} required />
          {platform && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Detected: {platform} embed</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <Input label="Title" placeholder="My Website" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} type="url" required />
            <Input label="Icon" placeholder="emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={nsfw}
              onChange={(e) => setNsfw(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-500 dark:border-slate-600"
            />
            Mark as 18+ content
          </label>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>{initial ? "Update" : `Add ${typeLabels[effectiveType]}`}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
