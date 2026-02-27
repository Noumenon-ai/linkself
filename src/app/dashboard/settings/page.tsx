"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Lock } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { canUseFeature } from "@/lib/plans";

const inputBase =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white";

function Section({ title, children, variant, badge }: { title: string; children: React.ReactNode; variant?: "danger"; badge?: string }) {
  const borderClass = variant === "danger"
    ? "border-red-200 dark:border-red-900/50"
    : "border-slate-200 dark:border-slate-700";
  return (
    <div className={`rounded-xl border bg-white p-6 dark:bg-slate-800 space-y-4 ${borderClass}`}>
      <div className="flex items-center gap-2">
        <h2 className={`text-lg font-semibold ${variant === "danger" ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
          {title}
        </h2>
        {badge && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            badge === "Business"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
          }`}>
            <Lock className="h-2.5 w-2.5" /> {badge}
          </span>
        )}
      </div>
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

  // Tracking & Analytics
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");

  // Privacy
  const [nsfw, setNsfw] = useState(0);
  const [hideFromSearch, setHideFromSearch] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(false);

  // Plan
  const [plan, setPlan] = useState("free");
  const [upgradeSuccess, setUpgradeSuccess] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    // Detect upgrade success from URL
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");
    if (upgraded) {
      setUpgradeSuccess(upgraded);
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }

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
        setNsfw(Number(data.nsfw) || 0);
        setHideFromSearch(Boolean(data.hide_from_search));
        setGaMeasurementId(data.ga_measurement_id || "");
        setFbPixelId(data.fb_pixel_id || "");
        setTiktokPixelId(data.tiktok_pixel_id || "");
        setPagePassword(data.page_password || "");
        setPasswordEnabled(Boolean(data.page_password));
        setPlan(data.plan || "free");
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
          ga_measurement_id: gaMeasurementId,
          fb_pixel_id: fbPixelId,
          tiktok_pixel_id: tiktokPixelId,
          page_password: passwordEnabled ? pagePassword : "",
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

      {/* Upgrade Success Banner */}
      {upgradeSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between">
          <span>
            Successfully upgraded to <span className="font-semibold capitalize">{upgradeSuccess}</span>! Enjoy your new features.
          </span>
          <button onClick={() => setUpgradeSuccess("")} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Plan & Billing Section */}
      <Section title="Plan & Billing">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Current Plan:</span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            plan === "business" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
            plan === "pro" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" :
            "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          }`}>
            {plan}
          </span>
          {plan === "pro" && (
            <span className="text-sm text-slate-500 dark:text-slate-400">($9/mo)</span>
          )}
          {plan === "business" && (
            <span className="text-sm text-slate-500 dark:text-slate-400">($29/mo)</span>
          )}
        </div>

        {plan === "free" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/api/stripe/checkout?plan=pro"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Upgrade to Pro - $9/mo
            </a>
            <a
              href="/api/stripe/checkout?plan=business"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors shadow-sm"
            >
              Upgrade to Business - $29/mo
            </a>
          </div>
        )}

        {plan === "pro" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/api/stripe/checkout?plan=business"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors shadow-sm"
            >
              Upgrade to Business - $29/mo
            </a>
          </div>
        )}

        {plan !== "free" && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Manage your subscription and billing details through the Stripe customer portal.
            <a href="#" className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Manage Subscription
            </a>
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <a
            href="/pricing"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            Compare all plans &rarr;
          </a>
        </div>
      </Section>

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
      <Section title="SEO & Meta" badge={canUseFeature(plan, "seoControls") ? undefined : "Pro"}>
        {!canUseFeature(plan, "seoControls") && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-800 p-3 text-center">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              SEO controls require a Pro plan.{" "}
              <a href="/pricing" className="font-semibold underline hover:no-underline">Upgrade</a>
            </p>
          </div>
        )}
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

      {/* Tracking & Analytics Section */}
      <Section title="Tracking & Analytics" badge={canUseFeature(plan, "gaPixel") ? undefined : "Business"}>
        {!canUseFeature(plan, "gaPixel") && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tracking pixels require a Business plan.{" "}
              <a href="/pricing" className="font-semibold underline hover:no-underline">Upgrade</a>
            </p>
          </div>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add tracking pixels to measure traffic on your profile page. Paste your IDs below and they will be automatically injected into your public page.
        </p>
        <div className={!canUseFeature(plan, "gaPixel") ? "opacity-50 pointer-events-none" : ""}>
          <Input
            label="Google Analytics Measurement ID"
            value={gaMeasurementId}
            onChange={(e) => setGaMeasurementId(e.target.value.trim())}
            placeholder="G-XXXXXXXXXX"
            hint="Find this in Google Analytics > Admin > Data Streams. Tracks page views, traffic sources, and visitor behavior."
          />
        </div>
        <div className={!canUseFeature(plan, "fbPixel") ? "opacity-50 pointer-events-none" : ""}>
          <Input
            label="Facebook Pixel ID"
            value={fbPixelId}
            onChange={(e) => setFbPixelId(e.target.value.trim())}
            placeholder="1234567890"
            hint="Find this in Meta Events Manager > Pixels. Enables retargeting and conversion tracking for Facebook & Instagram ads."
          />
        </div>
        <div className={!canUseFeature(plan, "tiktokPixel") ? "opacity-50 pointer-events-none" : ""}>
          <Input
            label="TikTok Pixel ID"
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value.trim())}
            placeholder="XXXXXXXXX"
            hint="Find this in TikTok Ads Manager > Events. Tracks conversions from TikTok ad campaigns."
          />
        </div>
      </Section>

      {/* Privacy & Security Section */}
      <Section title="Privacy & Security">
        <Toggle
          label="18+ Content Warning (NSFW)"
          description="Visitors must confirm their age before viewing your page. Use Appearance page for granular per-link control."
          checked={nsfw > 0}
          onChange={(v) => setNsfw(v ? 1 : 0)}
          color="red"
        />
        <Toggle
          label="Hide from Search Engines"
          description="Adds a noindex tag so Google and other search engines won't list your page"
          checked={hideFromSearch}
          onChange={setHideFromSearch}
        />
        <div className="relative">
          {!canUseFeature(plan, "passwordProtection") && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <Lock className="h-2.5 w-2.5" /> Business
              </span>
            </div>
          )}
          <Toggle
            label="Password-Protect Page"
            description={canUseFeature(plan, "passwordProtection") ? "Visitors must enter a password to view your profile page" : "Requires Business plan - visitors must enter a password to view your page"}
            checked={passwordEnabled}
            onChange={(v) => {
              if (!canUseFeature(plan, "passwordProtection")) return;
              setPasswordEnabled(v);
              if (!v) setPagePassword("");
            }}
            color="amber"
          />
        </div>
        {passwordEnabled && (
          <div className="ml-4 pl-4 border-l-2 border-amber-300 dark:border-amber-700">
            <Input
              label="Page Password"
              value={pagePassword}
              onChange={(e) => setPagePassword(e.target.value)}
              placeholder="Enter a password..."
              maxLength={100}
              hint="Visitors must enter this password to view your page. Keep it simple and shareable."
            />
          </div>
        )}
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
