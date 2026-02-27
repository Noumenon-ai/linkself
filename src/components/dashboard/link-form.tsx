"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronUp, Image } from "lucide-react";

type LinkType = "link" | "header" | "divider" | "embed" | "email-collector" | "countdown" | "contact-form" | "faq" | "image-gallery" | "testimonial" | "map";

export interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  link_type?: LinkType;
  embed_url?: string;
  nsfw?: boolean;
  block_config?: string;
  thumbnail_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface LinkFormProps {
  onSave: (data: LinkFormData) => Promise<void>;
  initial?: { title: string; url: string; icon: string; link_type?: string; embed_url?: string; nsfw?: boolean; block_config?: string; thumbnail_url?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  onCancel?: () => void;
  linkType?: LinkType;
}

function detectEmbedPlatform(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) return "YouTube";
  if (url.includes("open.spotify.com/")) return "Spotify";
  return "Generic";
}

function parseBlockConfig<T>(config: string | undefined, fallback: T): T {
  if (!config) return fallback;
  try { return JSON.parse(config) as T; } catch { return fallback; }
}

export function LinkForm({ onSave, initial, onCancel, linkType: forcedType }: LinkFormProps) {
  const effectiveType = forcedType ?? (initial?.link_type as LinkType) ?? "link";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [embedUrl, setEmbedUrl] = useState(initial?.embed_url ?? "");
  const [nsfw, setNsfw] = useState(initial?.nsfw ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
  const [utmSource, setUtmSource] = useState(initial?.utm_source ?? "");
  const [utmMedium, setUtmMedium] = useState(initial?.utm_medium ?? "");
  const [utmCampaign, setUtmCampaign] = useState(initial?.utm_campaign ?? "");
  const [showUtm, setShowUtm] = useState(Boolean(initial?.utm_source || initial?.utm_medium || initial?.utm_campaign));
  const [showThumbnail, setShowThumbnail] = useState(Boolean(initial?.thumbnail_url));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email Collector state
  const emailDefaults = parseBlockConfig<{ buttonText: string; placeholder: string }>(initial?.block_config, { buttonText: "Subscribe", placeholder: "Enter your email" });
  const [emailButtonText, setEmailButtonText] = useState(emailDefaults.buttonText);
  const [emailPlaceholder, setEmailPlaceholder] = useState(emailDefaults.placeholder);

  // Countdown state
  const countdownDefaults = parseBlockConfig<{ targetDate: string }>(initial?.block_config, { targetDate: "" });
  const [targetDate, setTargetDate] = useState(countdownDefaults.targetDate);

  // Contact Form state
  const contactDefaults = parseBlockConfig<{ email: string; fields: string[] }>(initial?.block_config, { email: "", fields: ["name", "email", "message"] });
  const [contactEmail, setContactEmail] = useState(contactDefaults.email);

  // FAQ state
  const faqDefaults = parseBlockConfig<{ items: { q: string; a: string }[] }>(initial?.block_config, { items: [{ q: "", a: "" }] });
  const [faqItems, setFaqItems] = useState(faqDefaults.items);

  // Image Gallery state
  const galleryDefaults = parseBlockConfig<{ images: string[] }>(initial?.block_config, { images: [""] });
  const [galleryImages, setGalleryImages] = useState(galleryDefaults.images);

  // Testimonial state
  const testimonialDefaults = parseBlockConfig<{ quote: string; author: string; role: string }>(initial?.block_config, { quote: "", author: "", role: "" });
  const [quote, setQuote] = useState(testimonialDefaults.quote);
  const [author, setAuthor] = useState(testimonialDefaults.author);
  const [role, setRole] = useState(testimonialDefaults.role);

  // Map state
  const mapDefaults = parseBlockConfig<{ address: string; embedUrl: string }>(initial?.block_config, { address: "", embedUrl: "" });
  const [mapAddress, setMapAddress] = useState(mapDefaults.address);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(mapDefaults.embedUrl);

  const platform = effectiveType === "embed" ? detectEmbedPlatform(embedUrl) : "";

  function buildBlockConfig(): string {
    switch (effectiveType) {
      case "email-collector":
        return JSON.stringify({ buttonText: emailButtonText, placeholder: emailPlaceholder });
      case "countdown":
        return JSON.stringify({ targetDate });
      case "contact-form":
        return JSON.stringify({ email: contactEmail, fields: ["name", "email", "message"] });
      case "faq":
        return JSON.stringify({ items: faqItems.filter(item => item.q.trim() || item.a.trim()) });
      case "image-gallery":
        return JSON.stringify({ images: galleryImages.filter(img => img.trim()) });
      case "testimonial":
        return JSON.stringify({ quote, author, role });
      case "map":
        return JSON.stringify({ address: mapAddress, embedUrl: mapEmbedUrl });
      default:
        return "";
    }
  }

  const noUrlTypes: LinkType[] = ["header", "divider", "email-collector", "countdown", "contact-form", "faq", "image-gallery", "testimonial", "map"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data: LinkFormData = {
        title: effectiveType === "divider" ? "---" : title,
        url: noUrlTypes.includes(effectiveType) ? "" : url,
        icon,
        link_type: effectiveType,
        nsfw,
        thumbnail_url: thumbnailUrl || undefined,
        utm_source: utmSource || undefined,
        utm_medium: utmMedium || undefined,
        utm_campaign: utmCampaign || undefined,
      };
      if (effectiveType === "embed") {
        data.embed_url = embedUrl;
        data.url = embedUrl || "";
      }
      const bc = buildBlockConfig();
      if (bc) {
        data.block_config = bc;
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
    "email-collector": "Email Collector",
    countdown: "Countdown",
    "contact-form": "Contact Form",
    faq: "FAQ",
    "image-gallery": "Gallery",
    testimonial: "Testimonial",
    map: "Map",
  };

  function renderFormFields() {
    switch (effectiveType) {
      case "divider":
        return <p className="text-sm text-slate-500 dark:text-slate-400">This will add a horizontal divider line between your links.</p>;

      case "header":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <Input label="Section Title" placeholder="My Projects" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Icon" placeholder="emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
          </div>
        );

      case "embed":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="My Video" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Embed URL" placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..." value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} required />
            {platform && <p className="text-xs text-indigo-600 dark:text-indigo-400">Detected: {platform} embed</p>}
          </div>
        );

      case "email-collector":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="Join my newsletter" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Button Text" placeholder="Subscribe" value={emailButtonText} onChange={(e) => setEmailButtonText(e.target.value)} />
              <Input label="Placeholder Text" placeholder="Enter your email" value={emailPlaceholder} onChange={(e) => setEmailPlaceholder(e.target.value)} />
            </div>
          </div>
        );

      case "countdown":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="Album drops in" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        );

      case "contact-form":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="Get in touch" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Send messages to (email)" placeholder="me@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" required />
            <p className="text-xs text-slate-500 dark:text-slate-400">Visitors will see name, email, and message fields.</p>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="FAQ" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Questions & Answers</label>
              {faqItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Question"
                      value={item.q}
                      onChange={(e) => {
                        const updated = [...faqItems];
                        updated[idx] = { ...updated[idx], q: e.target.value };
                        setFaqItems(updated);
                      }}
                    />
                    <Input
                      placeholder="Answer"
                      value={item.a}
                      onChange={(e) => {
                        const updated = [...faqItems];
                        updated[idx] = { ...updated[idx], a: e.target.value };
                        setFaqItems(updated);
                      }}
                    />
                  </div>
                  {faqItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFaqItems(faqItems.filter((_, i) => i !== idx))}
                      className="mt-2 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaqItems([...faqItems, { q: "", a: "" }])}
                className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>
          </div>
        );

      case "image-gallery":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="Photo Gallery" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image URLs</label>
              {galleryImages.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={img}
                    onChange={(e) => {
                      const updated = [...galleryImages];
                      updated[idx] = e.target.value;
                      setGalleryImages(updated);
                    }}
                    className="flex-1"
                  />
                  {galleryImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGalleryImages([...galleryImages, ""])}
                className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add image
              </button>
            </div>
          </div>
        );

      case "testimonial":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="What people say" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quote</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="This product changed my life..."
                rows={3}
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Author Name" placeholder="Jane Doe" value={author} onChange={(e) => setAuthor(e.target.value)} required />
              <Input label="Author Title/Role" placeholder="CEO, Acme Inc" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          </div>
        );

      case "map":
        return (
          <div className="space-y-3">
            <Input label="Title" placeholder="Find us here" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Address" placeholder="123 Main St, City, State" value={mapAddress} onChange={(e) => setMapAddress(e.target.value)} />
            <Input label="Google Maps Embed URL" placeholder="https://www.google.com/maps/embed?pb=..." value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} />
            <p className="text-xs text-slate-500 dark:text-slate-400">Paste a Google Maps embed URL, or just enter an address for display.</p>
          </div>
        );

      default: // "link"
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
              <Input label="Title" placeholder="My Website" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} type="url" required />
              <Input label="Icon" placeholder="emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
            </div>

            {/* Thumbnail */}
            <div>
              <button
                type="button"
                onClick={() => setShowThumbnail(!showThumbnail)}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <Image className="h-3.5 w-3.5" />
                Thumbnail
                {showThumbnail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showThumbnail && (
                <div className="mt-2 space-y-2">
                  <Input
                    label="Thumbnail URL"
                    placeholder="https://example.com/image.png"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                  {thumbnailUrl && (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Preview</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* UTM Parameters */}
            <div>
              <button
                type="button"
                onClick={() => setShowUtm(!showUtm)}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                UTM Parameters
                {showUtm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showUtm && (
                <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input label="UTM Source" placeholder="instagram" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
                    <Input label="UTM Medium" placeholder="social" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} />
                    <Input label="UTM Campaign" placeholder="spring_sale" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
                  </div>
                  {url && (utmSource || utmMedium || utmCampaign) && (
                    <div className="mt-2">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Final URL Preview</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 break-all font-mono bg-white dark:bg-slate-800 rounded px-2 py-1.5 border border-slate-200 dark:border-slate-700">
                        {(() => {
                          try {
                            const u = new URL(url);
                            if (utmSource) u.searchParams.set("utm_source", utmSource);
                            if (utmMedium) u.searchParams.set("utm_medium", utmMedium);
                            if (utmCampaign) u.searchParams.set("utm_campaign", utmCampaign);
                            return u.toString();
                          } catch {
                            return url;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {renderFormFields()}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>{initial ? "Update" : `Add ${typeLabels[effectiveType]}`}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
