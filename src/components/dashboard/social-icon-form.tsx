"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Platform definitions                                               */
/* ------------------------------------------------------------------ */

interface PlatformDef {
  id: string;
  name: string;
  prefix: string;
  suffix?: string;
  placeholder: string;
  isFullUrl?: boolean;
}

const SOCIAL_PLATFORMS: PlatformDef[] = [
  { id: "instagram", name: "Instagram", prefix: "https://instagram.com/", placeholder: "username" },
  { id: "tiktok", name: "TikTok", prefix: "https://tiktok.com/@", placeholder: "username" },
  { id: "youtube", name: "YouTube", prefix: "https://youtube.com/@", placeholder: "channel" },
  { id: "twitter", name: "X (Twitter)", prefix: "https://x.com/", placeholder: "handle" },
  { id: "threads", name: "Threads", prefix: "https://threads.net/@", placeholder: "username" },
  { id: "facebook", name: "Facebook", prefix: "https://facebook.com/", placeholder: "profile" },
  { id: "linkedin", name: "LinkedIn", prefix: "https://linkedin.com/in/", placeholder: "username" },
  { id: "github", name: "GitHub", prefix: "https://github.com/", placeholder: "username" },
  { id: "twitch", name: "Twitch", prefix: "https://twitch.tv/", placeholder: "channel" },
  { id: "discord", name: "Discord", prefix: "https://discord.gg/", placeholder: "invite-code" },
  { id: "spotify", name: "Spotify", prefix: "https://open.spotify.com/user/", placeholder: "user-id" },
  { id: "snapchat", name: "Snapchat", prefix: "https://snapchat.com/add/", placeholder: "username" },
  { id: "pinterest", name: "Pinterest", prefix: "https://pinterest.com/", placeholder: "username" },
  { id: "reddit", name: "Reddit", prefix: "https://reddit.com/u/", placeholder: "username" },
  { id: "tumblr", name: "Tumblr", prefix: "https://", suffix: ".tumblr.com", placeholder: "blog-name" },
  { id: "whatsapp", name: "WhatsApp", prefix: "https://wa.me/", placeholder: "phone-number" },
  { id: "telegram", name: "Telegram", prefix: "https://t.me/", placeholder: "username" },
  { id: "bluesky", name: "Bluesky", prefix: "https://bsky.app/profile/", placeholder: "handle.bsky.social" },
  { id: "mastodon", name: "Mastodon", prefix: "", placeholder: "user@instance.social", isFullUrl: true },
  { id: "soundcloud", name: "SoundCloud", prefix: "https://soundcloud.com/", placeholder: "artist" },
  { id: "apple-music", name: "Apple Music", prefix: "https://music.apple.com/artist/", placeholder: "artist-id" },
  { id: "bandcamp", name: "Bandcamp", prefix: "https://", suffix: ".bandcamp.com", placeholder: "artist" },
  { id: "patreon", name: "Patreon", prefix: "https://patreon.com/", placeholder: "creator" },
  { id: "ko-fi", name: "Ko-fi", prefix: "https://ko-fi.com/", placeholder: "username" },
  { id: "cashapp", name: "Cash App", prefix: "https://cash.app/$", placeholder: "cashtag" },
  { id: "venmo", name: "Venmo", prefix: "https://venmo.com/", placeholder: "username" },
  { id: "email", name: "Email", prefix: "mailto:", placeholder: "you@email.com" },
  { id: "website", name: "Website", prefix: "", placeholder: "https://yoursite.com", isFullUrl: true },
  { id: "custom", name: "Custom URL", prefix: "", placeholder: "https://example.com/you", isFullUrl: true },
];

const PLATFORM_MAP = new Map(SOCIAL_PLATFORMS.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildUrl(platform: PlatformDef, value: string): string {
  if (!value) return "";
  if (platform.isFullUrl) return value;
  if (platform.suffix) return `${platform.prefix}${value}${platform.suffix}`;
  return `${platform.prefix}${value}`;
}

/** Visible prefix label shown in the input adornment */
function displayPrefix(platform: PlatformDef): string {
  if (platform.isFullUrl) return "";
  // Strip protocol for display (shorter in the UI)
  const stripped = platform.prefix
    .replace(/^https?:\/\//, "")
    .replace(/^mailto:/, "mailto:");
  // For suffix platforms like tumblr/bandcamp, show the prefix part
  return stripped;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SocialIconFormProps {
  onSave: (data: { platform: string; url: string }) => Promise<void>;
}

export function SocialIconForm({ onSave }: SocialIconFormProps) {
  const [platformId, setPlatformId] = useState("instagram");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const platform = PLATFORM_MAP.get(platformId) ?? SOCIAL_PLATFORMS[0];
  const prefixLabel = displayPrefix(platform);
  const generatedUrl = useMemo(() => buildUrl(platform, value.trim()), [platform, value]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    try {
      await onSave({ platform: platformId, url: generatedUrl });
      setValue("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row: platform selector + username input + add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Platform dropdown */}
        <div className="space-y-1.5 sm:w-48 shrink-0">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Platform
          </label>
          <div className="relative">
            <select
              value={platformId}
              onChange={(e) => {
                setPlatformId(e.target.value);
                setValue("");
              }}
              className="block w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Username / URL input with prefix adornment */}
        <div className="flex-1 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {platform.isFullUrl ? "URL" : "Username"}
          </label>
          <div className="flex">
            {prefixLabel && (
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-500 select-none whitespace-nowrap dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400">
                {prefixLabel}
              </span>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={platform.placeholder}
              required
              className={[
                "block w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
                "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors",
                "dark:bg-slate-800 dark:border-slate-600 dark:text-white",
                prefixLabel && platform.suffix
                  ? "rounded-none border-x-0"
                  : prefixLabel
                    ? "rounded-l-none rounded-r-lg"
                    : platform.suffix
                      ? "rounded-l-lg rounded-r-none border-r-0"
                      : "rounded-lg",
              ].join(" ")}
            />
            {platform.suffix && (
              <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-500 select-none whitespace-nowrap dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400">
                {platform.suffix}
              </span>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="shrink-0">
          Add
        </Button>
      </div>

      {/* URL preview */}
      {value.trim() && generatedUrl && (
        <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">{generatedUrl}</span>
        </div>
      )}
    </form>
  );
}
