import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { queryOne, queryAll } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import { canUseFeature, isAdmin } from "@/lib/plans";
import {
  buildBackgroundStyle,
  buildButtonStyle,
  normalizeBackgroundType,
  sanitizeCustomCss,
  getBtnShapeClass,
  getBtnHoverClass,
  getBtnShadowClass,
  getFontSizeClass,
  getGoogleFontsUrl,
  getLayoutClasses,
  getAvatarShapeClass,
  getAvatarBorderClass,
} from "@/lib/profile-customization";
import { Avatar } from "@/components/profile/avatar";
import { SocialIconsRow } from "@/components/profile/social-icons-row";
import { AgeGate } from "@/components/profile/age-gate";
import { TipButton } from "@/components/profile/tip-button";
import { NsfwLinkOverlay } from "@/components/profile/nsfw-link-overlay";
import { EmbedRenderer } from "@/components/profile/embed-renderer";
import { PasswordGate } from "@/components/profile/password-gate";
import { CountdownBlock } from "@/components/profile/blocks/countdown-block";
import { FaqBlock } from "@/components/profile/blocks/faq-block";
import { EmailCollectorBlock } from "@/components/profile/blocks/email-collector-block";
import { ContactFormBlock } from "@/components/profile/blocks/contact-form-block";
import type { UserRow, LinkRow, SocialIconRow } from "@/lib/db/schema";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await queryOne<UserRow>(
    "SELECT display_name, bio, avatar_url, seo_title, seo_description, og_image_url, hide_from_search FROM users WHERE username = ?",
    username
  );

  if (!user) return { title: "Not Found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const title = user.seo_title?.trim() || `${user.display_name} | LinkSelf`;
  const description = user.seo_description?.trim() || user.bio || `Check out ${user.display_name}'s links`;
  const ogImage = user.og_image_url?.trim() || user.avatar_url || undefined;

  return {
    title,
    description,
    ...(user.hide_from_search ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: user.seo_title?.trim() || user.display_name,
      description,
      url: `${appUrl}/${username}`,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary",
      title: user.seo_title?.trim() || user.display_name,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const maybeUser = await queryOne<UserRow>("SELECT * FROM users WHERE username = ?", username);
  if (!maybeUser) notFound();
  const user = maybeUser;

  const allLinks = await queryAll<LinkRow>("SELECT * FROM links WHERE user_id = ? AND is_active = 1 ORDER BY position ASC", user.id);
  const socialIcons = await queryAll<SocialIconRow>("SELECT * FROM social_icons WHERE user_id = ? ORDER BY position ASC", user.id);

  // Filter out scheduled links that are not yet live or have expired
  const now = new Date();
  const links = allLinks.filter((link) => {
    if (link.scheduled_start && link.scheduled_start.trim() !== "") {
      if (new Date(link.scheduled_start) > now) return false;
    }
    if (link.scheduled_end && link.scheduled_end.trim() !== "") {
      if (new Date(link.scheduled_end) < now) return false;
    }
    return true;
  });

  // Sort pinned links to the top, preserving position order within each group
  const sortedLinks = [...links].sort((a, b) => {
    const aPinned = a.is_pinned ? 1 : 0;
    const bPinned = b.is_pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return a.position - b.position;
  });

  const theme = getTheme(user.theme);
  const bgStyle = buildBackgroundStyle({
    bg_type: user.bg_type,
    bg_color: user.bg_color,
    bg_gradient_from: user.bg_gradient_from,
    bg_gradient_to: user.bg_gradient_to,
    bg_gradient_direction: user.bg_gradient_direction,
    bg_image_url: user.bg_image_url,
  });
  const bgTypeNorm = normalizeBackgroundType(user.bg_type);
  const useThemeBg = bgTypeNorm === "theme";
  const isVideoBg = bgTypeNorm === "video";
  const customCss = sanitizeCustomCss(user.custom_css);

  // Sanitize video URL (must be http/https)
  let videoUrl: string | null = null;
  if (isVideoBg && user.bg_image_url) {
    try {
      const parsed = new URL(user.bg_image_url.trim());
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        videoUrl = parsed.toString();
      }
    } catch { /* invalid URL, ignore */ }
  }

  // Button defaults from user settings
  const defaultBtnStyle = buildButtonStyle({ btn_color: user.btn_color, btn_text_color: user.btn_text_color });
  const btnShape = getBtnShapeClass(user.btn_shape);
  const btnHover = getBtnHoverClass(user.btn_hover);
  const btnShadow = getBtnShadowClass(user.btn_shadow);

  // Typography
  const fontFamily = user.font_family || "Inter";
  const fontSize = getFontSizeClass(user.font_size);
  const textColor = user.text_color?.trim() || "";

  // Layout
  const layout = getLayoutClasses(user.layout);

  // Avatar
  const avatarShape = getAvatarShapeClass(user.avatar_shape);
  const avatarBorder = getAvatarBorderClass(user.avatar_border);
  const hideAvatar = user.avatar_shape === "none";

  // Branding - Pro and Business can remove branding
  const effectivePlan = isAdmin(user.username) ? "business" : (user.plan || "free");
  const hideBranding = canUseFeature(effectivePlan, "removeBranding");

  // Text color override style
  const textStyle = textColor ? { color: textColor } : {};

  // NSFW mode: 0 = off, 1 = entire profile, 2 = individual links only
  const nsfwMode = Number(user.nsfw) || 0;

  // Animation
  const linkAnimation = user.link_animation || "fade-in";
  function getLinkAnimationClass(index: number): string {
    switch (linkAnimation) {
      case "none": return "";
      case "fade-in": return "animate-fade-in";
      case "slide-up": return "animate-slide-up";
      case "bounce": return "animate-bounce-in";
      case "stagger": return `animate-slide-up stagger-delay-${Math.min(index + 1, 12)}`;
      default: return "animate-fade-in";
    }
  }

  // Social position
  const socialTop = (user.social_position || "top") === "top";
  const socialIconsElement = (
    <SocialIconsRow icons={socialIcons} textClass={textColor ? "" : theme.textClass} className="social-row" style={textStyle} />
  );

  function parseConfig<T>(raw: string | undefined | null, fallback: T): T {
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }

  function renderLink(link: LinkRow, index: number) {
    const linkType = link.link_type || "link";

    // Divider type
    if (linkType === "divider") {
      return (
        <div key={link.id} className={`w-full py-2 ${getLinkAnimationClass(index)}`}>
          <hr className={`border-t ${textColor ? "" : "border-current opacity-20"}`} style={textColor ? { borderColor: textColor, opacity: 0.2 } : {}} />
        </div>
      );
    }

    // Header type
    if (linkType === "header") {
      return (
        <div key={link.id} className={`w-full py-1 ${getLinkAnimationClass(index)}`}>
          <h2
            className={`text-center font-bold text-lg ${textColor ? "" : theme.textClass}`}
            style={textStyle}
          >
            {link.icon && <span className="mr-2">{link.icon}</span>}
            {link.title}
          </h2>
        </div>
      );
    }

    // Embed type
    if (linkType === "embed") {
      const embedContent = (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <div className={textColor ? "" : theme.textClass} style={textStyle}>
            <EmbedRenderer title={link.title} embedUrl={link.embed_url || link.url} />
          </div>
        </div>
      );

      // Wrap in NSFW overlay if needed
      if (nsfwMode === 2 && link.nsfw === 1) {
        return <NsfwLinkOverlay key={link.id}>{embedContent}</NsfwLinkOverlay>;
      }
      return embedContent;
    }

    // Email Collector block
    if (linkType === "email-collector") {
      const config = parseConfig<{ buttonText: string; placeholder: string }>(link.block_config, { buttonText: "Subscribe", placeholder: "Enter your email" });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <EmailCollectorBlock
            title={link.title}
            buttonText={config.buttonText}
            placeholder={config.placeholder}
            textClass={textColor ? "" : theme.textClass}
            textStyle={textStyle}
          />
        </div>
      );
    }

    // Countdown block
    if (linkType === "countdown") {
      const config = parseConfig<{ targetDate: string }>(link.block_config, { targetDate: "" });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <CountdownBlock
            title={link.title}
            targetDate={config.targetDate}
            textClass={textColor ? "" : theme.textClass}
            textStyle={textStyle}
          />
        </div>
      );
    }

    // Contact Form block
    if (linkType === "contact-form") {
      const config = parseConfig<{ email: string; fields: string[] }>(link.block_config, { email: "", fields: ["name", "email", "message"] });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <ContactFormBlock
            title={link.title}
            email={config.email}
            textClass={textColor ? "" : theme.textClass}
            textStyle={textStyle}
          />
        </div>
      );
    }

    // FAQ / Accordion block
    if (linkType === "faq") {
      const config = parseConfig<{ items: { q: string; a: string }[] }>(link.block_config, { items: [] });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <FaqBlock
            title={link.title}
            items={config.items}
            textClass={textColor ? "" : theme.textClass}
            textStyle={textStyle}
          />
        </div>
      );
    }

    // Image Gallery block
    if (linkType === "image-gallery") {
      const config = parseConfig<{ images: string[] }>(link.block_config, { images: [] });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <p className={`text-sm font-medium mb-2 text-center ${textColor ? "" : theme.textClass}`} style={textStyle}>{link.title}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
            {config.images.filter(Boolean).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                alt={`Gallery image ${i + 1}`}
                className="h-32 w-32 rounded-lg object-cover flex-shrink-0 snap-start"
              />
            ))}
          </div>
        </div>
      );
    }

    // Testimonial block
    if (linkType === "testimonial") {
      const config = parseConfig<{ quote: string; author: string; role: string }>(link.block_config, { quote: "", author: "", role: "" });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <div className={`text-center py-3 ${textColor ? "" : theme.textClass}`} style={textStyle}>
            <p className="text-sm font-medium mb-2">{link.title}</p>
            <blockquote className="text-sm italic opacity-90 mb-2">&ldquo;{config.quote}&rdquo;</blockquote>
            <p className="text-xs font-semibold">{config.author}</p>
            {config.role && <p className="text-xs opacity-60">{config.role}</p>}
          </div>
        </div>
      );
    }

    // Map / Location block
    if (linkType === "map") {
      const config = parseConfig<{ address: string; embedUrl: string }>(link.block_config, { address: "", embedUrl: "" });
      return (
        <div key={link.id} className={`w-full ${getLinkAnimationClass(index)}`}>
          <p className={`text-sm font-medium mb-2 text-center ${textColor ? "" : theme.textClass}`} style={textStyle}>{link.title}</p>
          {config.embedUrl ? (
            <iframe
              src={config.embedUrl}
              className="w-full h-48 rounded-lg border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={link.title || "Map"}
            />
          ) : config.address ? (
            <div className={`text-center text-sm opacity-80 ${textColor ? "" : theme.textClass}`} style={textStyle}>
              <p>{config.address}</p>
            </div>
          ) : null}
        </div>
      );
    }

    // Standard link type
    const linkBtnStyle = link.bg_color || link.text_color
      ? buildButtonStyle({ btn_color: link.bg_color || user.btn_color, btn_text_color: link.text_color || user.btn_text_color })
      : defaultBtnStyle;
    const linkShape = link.shape ? getBtnShapeClass(link.shape) : btnShape;
    const animClass = getLinkAnimationClass(index);

    const linkElement = (
      <a
        key={link.id}
        href={`/api/click/${link.id}`}
        className={`link-button block w-full px-5 py-3.5 text-center font-semibold transition-all duration-200 ${linkShape} ${btnHover} ${btnShadow} ${!link.bg_color && !user.btn_color ? theme.cardClass : ""} ${animClass}`}
        style={linkBtnStyle}
      >
        <span className="flex items-center justify-center gap-3">
          {link.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/20 flex-shrink-0" />
          )}
          {link.icon && <span>{link.icon}</span>}
          <span>{link.title}</span>
          {link.is_pinned === 1 && (
            <svg className="h-3.5 w-3.5 flex-shrink-0 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
          )}
          {link.nsfw === 1 && nsfwMode !== 2 && (
            <span className="ml-1 inline-flex items-center rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-red-400">18+</span>
          )}
        </span>
      </a>
    );

    // Wrap in NSFW overlay if individual link mode
    if (nsfwMode === 2 && link.nsfw === 1) {
      return <NsfwLinkOverlay key={link.id}>{linkElement}</NsfwLinkOverlay>;
    }

    return linkElement;
  }

  // Tracking IDs
  const gaId = user.ga_measurement_id?.trim() || "";
  const fbId = user.fb_pixel_id?.trim() || "";
  const ttId = user.tiktok_pixel_id?.trim() || "";

  const content = (
    <>
      {/* Google Font */}
      {fontFamily !== "Inter" && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={getGoogleFontsUrl(fontFamily)} />
      )}

      {/* Google Analytics */}
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "")}');`}</Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {fbId && (
        <Script id="fb-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbId.replace(/'/g, "")}');fbq('track','PageView');`}</Script>
      )}

      {/* TikTok Pixel */}
      {ttId && (
        <Script id="tt-pixel" strategy="afterInteractive">{`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${ttId.replace(/'/g, "")}');ttq.page();}(window,document,'ttq');`}</Script>
      )}

      <main
        className={`profile-page relative min-h-screen flex flex-col ${layout.wrapper} px-4 py-12 ${useThemeBg ? theme.bgClass : ""}`.trim()}
        style={{ ...bgStyle, fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {/* Video Background */}
        {isVideoBg && videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="fixed inset-0 h-full w-full object-cover -z-10"
            src={videoUrl}
          />
        )}
        {customCss && <style>{customCss}</style>}

        <div className={`w-full max-w-md flex flex-col gap-6 animate-fade-in ${layout.inner}`}>
          {/* Avatar */}
          {!hideAvatar && (
            <div className={`profile-avatar ${avatarShape} ${avatarBorder} overflow-hidden`}>
              <Avatar
                src={user.avatar_url}
                name={user.display_name}
                ringClass={!user.avatar_border || user.avatar_border === "none" ? theme.avatarClass : ""}
                className={avatarShape}
              />
            </div>
          )}

          {/* Name & Bio */}
          <div>
            <h1
              className={`profile-name ${fontSize.name} font-bold ${textColor ? "" : theme.textClass}`}
              style={textStyle}
            >
              {user.display_name}
            </h1>
            {user.bio && (
              <p
                className={`profile-bio mt-2 ${fontSize.bio} opacity-80 max-w-xs ${textColor ? "" : theme.textClass}`}
                style={textStyle}
              >
                {user.bio}
              </p>
            )}
          </div>

          {/* Social Icons (top position) */}
          {socialTop && socialIconsElement}

          {/* Links */}
          <div className="w-full space-y-3">
            {sortedLinks.map((link, index) => renderLink(link, index))}
          </div>

          {/* Social Icons (bottom position) */}
          {!socialTop && socialIconsElement}

          {/* Tip/Donation */}
          {user.tip_enabled && user.tip_url && (
            <TipButton text={user.tip_text || "Buy me a coffee \u2615"} url={user.tip_url} />
          )}

          {/* Footer */}
          {!hideBranding && (
            <a
              href="/"
              className={`powered-by mt-8 text-xs ${theme.footerClass} hover:opacity-80 transition-opacity`}
            >
              {user.username} on LinkSelf
            </a>
          )}
        </div>
      </main>
    </>
  );

  // Wrap in password gate if needed
  const pagePassword = user.page_password?.trim() || "";
  const gatedContent = pagePassword
    ? <PasswordGate password={pagePassword}>{content}</PasswordGate>
    : content;

  // NSFW mode 1: entire profile age gate
  if (nsfwMode === 1) {
    return <AgeGate>{gatedContent}</AgeGate>;
  }
  // NSFW mode 0 or 2: no page-level gate (mode 2 handles individual links inline)
  return gatedContent;
}
