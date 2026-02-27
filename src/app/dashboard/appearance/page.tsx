"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeCard } from "@/components/dashboard/theme-card";
import { Avatar } from "@/components/profile/avatar";
import { apiFetch } from "@/lib/api-client";
import { themeList, getTheme } from "@/lib/themes";
import {
  buildBackgroundStyle,
  buildButtonStyle,
  normalizeBackgroundType,
  normalizeGradientDirection,
  normalizeHexColor,
  sanitizeCustomCss,
  getBtnShapeClass,
  getBtnHoverClass,
  getBtnShadowClass,
  getFontSizeClass,
  getLayoutClasses,
  getAvatarShapeClass,
  getAvatarBorderClass,
  FONT_FAMILIES,
  type BackgroundType,
  type GradientDirection,
  type BtnShape,
  type BtnHover,
  type BtnShadow,
  type FontFamily,
  type FontSize,
  type LayoutMode,
  type AvatarShape,
  type AvatarBorder,
} from "@/lib/profile-customization";

const DEFAULT_BG_COLOR = "#0f172a";
const DEFAULT_GRADIENT_FROM = "#1d4ed8";
const DEFAULT_GRADIENT_TO = "#7c3aed";

const inputBase =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white";

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-800" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" maxLength={7} className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputBase}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:bg-slate-800 dark:border-slate-700 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

export default function AppearancePage() {
  // Profile
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("");

  // Theme
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customCss, setCustomCss] = useState("");
  const [previewCss, setPreviewCss] = useState("");

  // Background
  const [bgType, setBgType] = useState<BackgroundType>("theme");
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [bgGradientFrom, setBgGradientFrom] = useState(DEFAULT_GRADIENT_FROM);
  const [bgGradientTo, setBgGradientTo] = useState(DEFAULT_GRADIENT_TO);
  const [bgGradientDirection, setBgGradientDirection] = useState<GradientDirection>("top-bottom");
  const [bgImageUrl, setBgImageUrl] = useState("");

  // Buttons
  const [btnShape, setBtnShape] = useState<BtnShape>("rounded");
  const [btnColor, setBtnColor] = useState("");
  const [btnTextColor, setBtnTextColor] = useState("");
  const [btnHover, setBtnHover] = useState<BtnHover>("scale");
  const [btnShadow, setBtnShadow] = useState<BtnShadow>("soft");

  // Typography
  const [fontFamily, setFontFamily] = useState<FontFamily>("Inter");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [textColor, setTextColor] = useState("");

  // Layout
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("centered");
  const [avatarShape, setAvatarShape] = useState<AvatarShape>("circle");
  const [avatarBorder, setAvatarBorder] = useState<AvatarBorder>("none");

  // NSFW
  const [nsfw, setNsfw] = useState(false);

  // Tip Jar
  const [tipEnabled, setTipEnabled] = useState(false);
  const [tipText, setTipText] = useState("");
  const [tipUrl, setTipUrl] = useState("");

  // Animation & Social Position
  const [linkAnimation, setLinkAnimation] = useState("fade-in");
  const [socialPosition, setSocialPosition] = useState("top");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    apiFetch<Record<string, string | null>>("/api/settings")
      .then((data) => {
        if (!mounted) return;
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setUsername(data.username || "");
        setSelectedTheme(data.theme || "default");
        setCustomCss(data.custom_css || "");
        setPreviewCss(sanitizeCustomCss(data.custom_css || ""));
        setBgType(normalizeBackgroundType(data.bg_type));
        setBgColor(normalizeHexColor(data.bg_color, DEFAULT_BG_COLOR));
        setBgGradientFrom(normalizeHexColor(data.bg_gradient_from, DEFAULT_GRADIENT_FROM));
        setBgGradientTo(normalizeHexColor(data.bg_gradient_to, DEFAULT_GRADIENT_TO));
        setBgGradientDirection(normalizeGradientDirection(data.bg_gradient_direction));
        setBgImageUrl(data.bg_image_url || "");
        setBtnShape((data.btn_shape as BtnShape) || "rounded");
        setBtnColor(data.btn_color || "");
        setBtnTextColor(data.btn_text_color || "");
        setBtnHover((data.btn_hover as BtnHover) || "scale");
        setBtnShadow((data.btn_shadow as BtnShadow) || "soft");
        setFontFamily((data.font_family as FontFamily) || "Inter");
        setFontSize((data.font_size as FontSize) || "medium");
        setTextColor(data.text_color || "");
        setLayoutMode((data.layout as LayoutMode) || "centered");
        setAvatarShape((data.avatar_shape as AvatarShape) || "circle");
        setAvatarBorder((data.avatar_border as AvatarBorder) || "none");
        setNsfw(Boolean(data.nsfw));
        setTipEnabled(Boolean(data.tip_enabled));
        setTipText(data.tip_text || "");
        setTipUrl(data.tip_url || "");
        setLinkAnimation(data.link_animation || "fade-in");
        setSocialPosition(data.social_position || "top");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      await apiFetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName, bio: bio || undefined, avatar_url: avatarUrl || null, username,
          theme: selectedTheme, custom_css: customCss,
          bg_type: bgType, bg_color: bgColor, bg_gradient_from: bgGradientFrom, bg_gradient_to: bgGradientTo, bg_gradient_direction: bgGradientDirection, bg_image_url: bgImageUrl,
          btn_shape: btnShape, btn_color: btnColor, btn_text_color: btnTextColor, btn_hover: btnHover, btn_shadow: btnShadow,
          font_family: fontFamily, font_size: fontSize, text_color: textColor,
          layout: layoutMode, avatar_shape: avatarShape, avatar_border: avatarBorder,
          nsfw, tip_enabled: tipEnabled, tip_text: tipText, tip_url: tipUrl,
          link_animation: linkAnimation, social_position: socialPosition,
        }),
      });
      setPreviewCss(sanitizeCustomCss(customCss));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>;
  }

  const theme = getTheme(selectedTheme);
  const previewBgStyle = buildBackgroundStyle({ bg_type: bgType, bg_color: bgColor, bg_gradient_from: bgGradientFrom, bg_gradient_to: bgGradientTo, bg_gradient_direction: bgGradientDirection, bg_image_url: bgImageUrl });
  const previewBtnStyle = buildButtonStyle({ btn_color: btnColor, btn_text_color: btnTextColor });
  const previewLayout = getLayoutClasses(layoutMode);
  const previewFontSize = getFontSizeClass(fontSize);
  const previewAvatarShape = getAvatarShapeClass(avatarShape);
  const previewAvatarBorder = getAvatarBorderClass(avatarBorder);
  const useThemeBg = bgType === "theme";
  const textStyle = textColor ? { color: textColor } : {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appearance</h1>
        <Button onClick={handleSave} loading={saving}>{saved ? "Saved!" : "Save Changes"}</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      {/* Profile */}
      <Section title="Profile">
        <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={280} className={inputBase} placeholder="Tell the world about yourself..." />
          <p className="text-xs text-slate-500">{bio.length}/280</p>
        </div>
        <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        <div className="space-y-1.5">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
          <p className="text-xs text-slate-500">Your link: linkself.com/{username}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">18+ Content Warning</p>
            <p className="text-xs text-slate-500">Visitors must confirm their age before viewing your page</p>
          </div>
          <button
            type="button"
            onClick={() => setNsfw(!nsfw)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${nsfw ? "bg-red-500" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${nsfw ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </Section>

      {/* Theme */}
      <Section title="Theme">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themeList.map((t) => <ThemeCard key={t.id} theme={t} selected={selectedTheme === t.id} onClick={() => setSelectedTheme(t.id)} />)}
        </div>
      </Section>

      {/* Background */}
      <Section title="Background">
        <SelectField label="Background Type" value={bgType} onChange={(v) => setBgType(v as BackgroundType)} options={[
          { value: "theme", label: "Use Theme Background" },
          { value: "solid", label: "Solid Color" },
          { value: "gradient", label: "Gradient" },
          { value: "image", label: "Image URL" },
        ]} />
        {bgType === "solid" && <ColorPicker label="Background Color" value={bgColor} onChange={setBgColor} />}
        {bgType === "gradient" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorPicker label="Gradient Start" value={bgGradientFrom} onChange={setBgGradientFrom} />
            <ColorPicker label="Gradient End" value={bgGradientTo} onChange={setBgGradientTo} />
            <div className="sm:col-span-2">
              <SelectField label="Direction" value={bgGradientDirection} onChange={(v) => setBgGradientDirection(v as GradientDirection)} options={[
                { value: "top-bottom", label: "Top to Bottom" },
                { value: "left-right", label: "Left to Right" },
                { value: "diagonal", label: "Diagonal" },
              ]} />
            </div>
          </div>
        )}
        {bgType === "image" && <Input label="Image URL" value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)} placeholder="https://..." />}
      </Section>

      {/* Button Style */}
      <Section title="Button Style">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Shape" value={btnShape} onChange={(v) => setBtnShape(v as BtnShape)} options={[
            { value: "rounded", label: "Rounded" },
            { value: "pill", label: "Pill" },
            { value: "square", label: "Square" },
            { value: "outline", label: "Outline" },
          ]} />
          <SelectField label="Hover Effect" value={btnHover} onChange={(v) => setBtnHover(v as BtnHover)} options={[
            { value: "scale", label: "Scale Up" },
            { value: "glow", label: "Glow" },
            { value: "slide", label: "Slide" },
            { value: "none", label: "None" },
          ]} />
          <SelectField label="Shadow" value={btnShadow} onChange={(v) => setBtnShadow(v as BtnShadow)} options={[
            { value: "soft", label: "Soft" },
            { value: "hard", label: "Hard" },
            { value: "none", label: "None" },
          ]} />
          <ColorPicker label="Button Color" value={btnColor} onChange={setBtnColor} />
          <ColorPicker label="Button Text Color" value={btnTextColor} onChange={setBtnTextColor} />
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Font Family" value={fontFamily} onChange={(v) => setFontFamily(v as FontFamily)} options={FONT_FAMILIES.map((f) => ({ value: f, label: f }))} />
          <SelectField label="Font Size" value={fontSize} onChange={(v) => setFontSize(v as FontSize)} options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]} />
          <ColorPicker label="Text Color" value={textColor} onChange={setTextColor} />
        </div>
      </Section>

      {/* Layout */}
      <Section title="Layout">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Page Layout" value={layoutMode} onChange={(v) => setLayoutMode(v as LayoutMode)} options={[
            { value: "centered", label: "Centered" },
            { value: "left", label: "Left Aligned" },
            { value: "card", label: "Card Style" },
          ]} />
          <SelectField label="Avatar Shape" value={avatarShape} onChange={(v) => setAvatarShape(v as AvatarShape)} options={[
            { value: "circle", label: "Circle" },
            { value: "square", label: "Square" },
            { value: "rounded-square", label: "Rounded Square" },
            { value: "none", label: "Hidden" },
          ]} />
          <SelectField label="Avatar Border" value={avatarBorder} onChange={(v) => setAvatarBorder(v as AvatarBorder)} options={[
            { value: "none", label: "None" },
            { value: "thin", label: "Thin Border" },
            { value: "ring", label: "Ring" },
            { value: "glow", label: "Glow" },
          ]} />
        </div>
      </Section>

      {/* Animation */}
      <Section title="Link Animation">
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose how your links animate when visitors load your profile page.</p>
        <SelectField label="Entrance Animation" value={linkAnimation} onChange={setLinkAnimation} options={[
          { value: "none", label: "None" },
          { value: "fade-in", label: "Fade In" },
          { value: "slide-up", label: "Slide Up" },
          { value: "bounce", label: "Bounce" },
          { value: "stagger", label: "Stagger (one by one)" },
        ]} />
      </Section>

      {/* Social Icons Position */}
      <Section title="Social Icons Position">
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose where your social media icons appear on your profile.</p>
        <SelectField label="Position" value={socialPosition} onChange={setSocialPosition} options={[
          { value: "top", label: "Top (above links)" },
          { value: "bottom", label: "Bottom (below links)" },
        ]} />
      </Section>

      {/* Tip Jar */}
      <Section title="Tip Jar / Donations">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Enable Tip Button</p>
            <p className="text-xs text-slate-500">Show a donation/tip button on your profile</p>
          </div>
          <button
            type="button"
            onClick={() => setTipEnabled(!tipEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${tipEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${tipEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        {tipEnabled && (
          <div className="space-y-4">
            <Input label="Button Text" value={tipText} onChange={(e) => setTipText(e.target.value)} placeholder="Buy me a coffee &#9749;" />
            <Input label="Payment URL" value={tipUrl} onChange={(e) => setTipUrl(e.target.value)} placeholder="https://paypal.me/you or https://ko-fi.com/you or https://buymeacoffee.com/you" />
            <p className="text-xs text-slate-500">Works with PayPal.me, Ko-fi, Buy Me a Coffee, Stripe payment links, Cash App, or any URL</p>
          </div>
        )}
      </Section>

      {/* Custom CSS */}
      <Section title="Custom CSS">
        <div className="space-y-1.5">
          <textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} rows={10} maxLength={5000} spellCheck={false} className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 font-mono text-xs leading-5 text-emerald-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none" placeholder={".profile-page {\n  border-radius: 24px;\n}\n.link-button {\n  text-transform: uppercase;\n}"} />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{customCss.length}/5000</span>
            <Button type="button" variant="secondary" onClick={() => setPreviewCss(sanitizeCustomCss(customCss))}>Preview CSS</Button>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Available selectors</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre text-xs text-slate-600 dark:text-slate-300">{".profile-page\n.profile-avatar\n.profile-name\n.profile-bio\n.link-button\n.social-row\n.powered-by"}</pre>
        </div>
      </Section>

      {/* Live Preview */}
      <Section title="Live Preview">
        <div
          className={`profile-page rounded-xl p-8 flex flex-col ${previewLayout.wrapper} gap-4 min-h-[320px] ${useThemeBg ? theme.bgClass : ""}`}
          style={{ ...previewBgStyle, fontFamily: `"${fontFamily}", sans-serif` }}
        >
          {previewCss && <style>{previewCss}</style>}

          <div className={`w-full max-w-xs flex flex-col gap-4 ${previewLayout.inner}`}>
            {avatarShape !== "none" && (
              <div className={`profile-avatar ${previewAvatarShape} ${previewAvatarBorder} overflow-hidden`}>
                <Avatar src={avatarUrl || null} name={displayName || "You"} ringClass={avatarBorder === "none" ? theme.avatarClass : ""} className={previewAvatarShape} />
              </div>
            )}

            <div>
              <h3 className={`profile-name ${previewFontSize.name} font-bold ${textColor ? "" : theme.textClass}`} style={textStyle}>{displayName || "Your Name"}</h3>
              {bio && <p className={`profile-bio mt-1 ${previewFontSize.bio} opacity-80 max-w-xs ${textColor ? "" : theme.textClass}`} style={textStyle}>{bio}</p>}
            </div>

            <div className="w-full space-y-2">
              {["My Website", "Follow Me"].map((t) => (
                <div
                  key={t}
                  className={`link-button block w-full px-4 py-3 text-center text-sm font-semibold transition-all duration-200 ${getBtnShapeClass(btnShape)} ${getBtnHoverClass(btnHover)} ${getBtnShadowClass(btnShadow)} ${!btnColor ? theme.cardClass : ""}`}
                  style={previewBtnStyle}
                >
                  {t}
                </div>
              ))}
            </div>

            <p className={`powered-by mt-4 text-xs ${theme.footerClass}`}>{displayName || "You"} on LinkSelf</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
