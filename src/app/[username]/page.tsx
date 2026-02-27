import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { queryOne, queryAll } from "@/lib/db";
import { getTheme } from "@/lib/themes";
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

  const user = await queryOne<UserRow>("SELECT * FROM users WHERE username = ?", username);
  if (!user) notFound();

  const links = await queryAll<LinkRow>("SELECT * FROM links WHERE user_id = ? AND is_active = 1 ORDER BY position ASC", user.id);
  const socialIcons = await queryAll<SocialIconRow>("SELECT * FROM social_icons WHERE user_id = ? ORDER BY position ASC", user.id);

  const theme = getTheme(user.theme);
  const bgStyle = buildBackgroundStyle({
    bg_type: user.bg_type,
    bg_color: user.bg_color,
    bg_gradient_from: user.bg_gradient_from,
    bg_gradient_to: user.bg_gradient_to,
    bg_gradient_direction: user.bg_gradient_direction,
    bg_image_url: user.bg_image_url,
  });
  const useThemeBg = normalizeBackgroundType(user.bg_type) === "theme";
  const customCss = sanitizeCustomCss(user.custom_css);

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

  // Branding
  const hideBranding = user.plan === "business";

  // Text color override style
  const textStyle = textColor ? { color: textColor } : {};

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

  const content = (
    <>
      {/* Google Font */}
      {fontFamily !== "Inter" && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={getGoogleFontsUrl(fontFamily)} />
      )}

      <main
        className={`profile-page min-h-screen flex flex-col ${layout.wrapper} px-4 py-12 ${useThemeBg ? theme.bgClass : ""}`.trim()}
        style={{ ...bgStyle, fontFamily: `"${fontFamily}", sans-serif` }}
      >
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
            {links.map((link, index) => {
              // Per-link overrides
              const linkBtnStyle = link.bg_color || link.text_color
                ? buildButtonStyle({ btn_color: link.bg_color || user.btn_color, btn_text_color: link.text_color || user.btn_text_color })
                : defaultBtnStyle;
              const linkShape = link.shape ? getBtnShapeClass(link.shape) : btnShape;
              const animClass = getLinkAnimationClass(index);

              return (
                <a
                  key={link.id}
                  href={`/api/click/${link.id}`}
                  className={`link-button block w-full px-5 py-3.5 text-center font-semibold transition-all duration-200 ${linkShape} ${btnHover} ${btnShadow} ${!link.bg_color && !user.btn_color ? theme.cardClass : ""} ${animClass}`}
                  style={linkBtnStyle}
                >
                  <span className="flex items-center justify-center gap-3">
                    {link.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={link.thumbnail_url} alt="" className="h-8 w-8 rounded object-cover" />
                    )}
                    {link.icon && <span>{link.icon}</span>}
                    <span>{link.title}</span>
                    {link.nsfw === 1 && (
                      <span className="ml-1 inline-flex items-center rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-red-400">18+</span>
                    )}
                  </span>
                </a>
              );
            })}
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
              {user.display_name} on LinkSelf
            </a>
          )}
        </div>
      </main>
    </>
  );

  if (user.nsfw) {
    return <AgeGate>{content}</AgeGate>;
  }
  return content;
}
