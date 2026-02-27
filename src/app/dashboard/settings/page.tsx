"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiFetch } from "@/lib/api-client";

const inputBase =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white";

function Section({ title, children, variant }: { title: string; children: React.ReactNode; variant?: "danger" }) {
  const borderClass = variant === "danger"
    ? "border-red-200 dark:border-red-900/50"
    : "border-slate-200 dark:border-slate-700";
  return (
    <div className={`rounded-xl border bg-white p-6 dark:bg-slate-800 space-y-4 ${borderClass}`}>
      <h2 className={`text-lg font-semibold ${variant === "danger" ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange, color = "indigo" }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: "indigo" | "red" | "amber";
}) {
  const colorMap = {
    indigo: "bg-indigo-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? colorMap[color] : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  // Account
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // SEO & Meta
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Privacy
  const [nsfw, setNsfw] = useState(false);
  const [hideFromSearch, setHideFromSearch] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    let mounted = true;
    apiFetch<Record<string, string | null>>("/api/settings")
      .then((data) => {
        if (!mounted) return;
        setUsername(data.username || "");
        setEmail(data.email || "");
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setSeoTitle(data.seo_title || "");
        setSeoDescription(data.seo_description || "");
        setOgImageUrl(data.og_image_url || "");
        setNsfw(Boolean(data.nsfw));
        setHideFromSearch(Boolean(data.hide_from_search));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load settings");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await apiFetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: displayName,
          bio: bio || undefined,
          seo_title: seoTitle,
          seo_description: seoDescription,
          og_image_url: ogImageUrl,
          nsfw,
          hide_from_search: hideFromSearch,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <Button onClick={handleSave} loading={saving}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Account Section */}
      <Section title="Account">
        <div className="space-y-1.5">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
          <p className="text-xs text-slate-500">
            Your link: <span className="font-medium text-indigo-600 dark:text-indigo-400">linkself.vercel.app/{username}</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            {email || "No email set"}
          </div>
          <p className="text-xs text-slate-500">Email cannot be changed at this time</p>
        </div>
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            className={inputBase}
            placeholder="Tell the world about yourself..."
          />
          <p className="text-xs text-slate-500">{bio.length}/280</p>
        </div>
      </Section>

      {/* SEO & Meta Section */}
      <Section title="SEO & Meta">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize how your page appears in search engines and social media shares.
        </p>
        <Input
          label="Page Title"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder={displayName ? `${displayName} | LinkSelf` : "Custom page title for browser tab & Google"}
          maxLength={120}
          hint="Leave empty to use your display name"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meta Description</label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            maxLength={300}
            className={inputBase}
            placeholder="A short description for social sharing and search results..."
          />
          <p className="text-xs text-slate-500">{seoDescription.length}/300</p>
        </div>
        <Input
          label="Open Graph Image URL"
          value={ogImageUrl}
          onChange={(e) => setOgImageUrl(e.target.value)}
          placeholder="https://example.com/og-image.png"
          hint="Preview image shown when your page is shared on social media (1200x630px recommended)"
        />
        {ogImageUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-xs font-medium text-slate-500">Preview:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImageUrl}
              alt="OG preview"
              className="h-32 w-auto rounded object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </Section>

      {/* Privacy & Security Section */}
      <Section title="Privacy & Security">
        <Toggle
          label="18+ Content Warning (NSFW)"
          description="Visitors must confirm their age before viewing your page"
          checked={nsfw}
          onChange={setNsfw}
          color="red"
        />
        <Toggle
          label="Hide from Search Engines"
          description="Adds a noindex tag so Google and other search engines won't list your page"
          checked={hideFromSearch}
          onChange={setHideFromSearch}
        />
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 opacity-60">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Password-Protect Page</p>
              <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-500">Require a password to view your profile page</p>
          </div>
          <button
            type="button"
            disabled
            className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-slate-300 dark:bg-slate-600"
          >
            <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm translate-x-0" />
          </button>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" variant="danger">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Once you delete your account, there is no going back. All your links, analytics, and profile data will be permanently removed.
        </p>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Delete Account
        </Button>
      </Section>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteConfirmText(""); }} title="Delete Account">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This action is <span className="font-semibold text-red-600">permanent and irreversible</span>. All your data will be deleted.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Type <span className="font-mono font-semibold text-red-600">delete my account</span> to confirm:
          </p>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete my account"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmText !== "delete my account"}
              onClick={() => {
                // Future: call DELETE /api/account endpoint
                alert("Account deletion is not yet implemented.");
                setDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
