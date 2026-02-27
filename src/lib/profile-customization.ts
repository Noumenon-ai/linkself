import type { CSSProperties } from "react";

export const BACKGROUND_TYPES = ["theme", "solid", "gradient", "image"] as const;
export type BackgroundType = (typeof BACKGROUND_TYPES)[number];

export const GRADIENT_DIRECTIONS = ["top-bottom", "left-right", "diagonal"] as const;
export type GradientDirection = (typeof GRADIENT_DIRECTIONS)[number];

const DEFAULT_SOLID_COLOR = "#0f172a";
const DEFAULT_GRADIENT_FROM = "#1d4ed8";
const DEFAULT_GRADIENT_TO = "#7c3aed";

const BLOCKED_CSS_PATTERNS: RegExp[] = [
  /<\s*\/?[a-z][^>]*>/gi,
  /javascript\s*:/gi,
  /url\s*\(\s*javascript/gi,
  /url\s*\(\s*data\s*:/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /@charset/gi,
  /position\s*:\s*fixed/gi,
  /position\s*:\s*absolute/gi,
  /-moz-binding/gi,
  /behavior\s*:/gi,
  /<\s*\/\s*style/gi,
];

function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function sanitizeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeHexColor(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  return isHexColor(trimmed) ? trimmed : fallback;
}

export function normalizeBackgroundType(value: string | null | undefined): BackgroundType {
  if (value === "solid" || value === "gradient" || value === "image") return value;
  return "theme";
}

export function normalizeGradientDirection(value: string | null | undefined): GradientDirection {
  if (value === "left-right" || value === "diagonal") return value;
  return "top-bottom";
}

interface BackgroundSettings {
  bg_type?: string | null;
  bg_color?: string | null;
  bg_gradient_from?: string | null;
  bg_gradient_to?: string | null;
  bg_gradient_direction?: string | null;
  bg_image_url?: string | null;
}

export function buildBackgroundStyle(settings: BackgroundSettings): CSSProperties {
  const bgType = normalizeBackgroundType(settings.bg_type);
  if (bgType === "theme") return {};

  if (bgType === "solid") {
    return {
      backgroundColor: normalizeHexColor(settings.bg_color, DEFAULT_SOLID_COLOR),
    };
  }

  if (bgType === "gradient") {
    const from = normalizeHexColor(settings.bg_gradient_from, DEFAULT_GRADIENT_FROM);
    const to = normalizeHexColor(settings.bg_gradient_to, DEFAULT_GRADIENT_TO);
    const direction = normalizeGradientDirection(settings.bg_gradient_direction);
    const cssDirection = direction === "top-bottom" ? "to bottom" : direction === "left-right" ? "to right" : "135deg";

    return {
      backgroundImage: `linear-gradient(${cssDirection}, ${from}, ${to})`,
    };
  }

  const imageUrl = sanitizeImageUrl(settings.bg_image_url);
  if (!imageUrl) return {};

  return {
    backgroundImage: `url("${imageUrl.replace(/"/g, "%22")}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function sanitizeCustomCss(css: string | null | undefined): string {
  if (!css) return "";

  let sanitized = css;
  for (const pattern of BLOCKED_CSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized.slice(0, 5000);
}

// ---- Button Style Utilities ----

export const BTN_SHAPES = ["rounded", "pill", "square", "outline"] as const;
export type BtnShape = (typeof BTN_SHAPES)[number];

export const BTN_HOVERS = ["scale", "glow", "slide", "none"] as const;
export type BtnHover = (typeof BTN_HOVERS)[number];

export const BTN_SHADOWS = ["none", "soft", "hard"] as const;
export type BtnShadow = (typeof BTN_SHADOWS)[number];

export function buildButtonStyle(settings: {
  btn_color?: string | null;
  btn_text_color?: string | null;
}): CSSProperties {
  const style: CSSProperties = {};
  const bg = settings.btn_color?.trim();
  const text = settings.btn_text_color?.trim();
  if (bg && isHexColor(bg)) { style.backgroundColor = bg; style.borderColor = bg; }
  if (text && isHexColor(text)) style.color = text;
  return style;
}

export function getBtnShapeClass(shape: string | null | undefined): string {
  switch (shape) {
    case "pill": return "rounded-full";
    case "square": return "rounded-none";
    case "outline": return "rounded-lg bg-transparent border-2";
    default: return "rounded-lg";
  }
}

export function getBtnHoverClass(hover: string | null | undefined): string {
  switch (hover) {
    case "glow": return "hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]";
    case "slide": return "hover:translate-x-1";
    case "none": return "";
    default: return "hover:scale-[1.02]";
  }
}

export function getBtnShadowClass(shadow: string | null | undefined): string {
  switch (shadow) {
    case "hard": return "shadow-lg";
    case "none": return "";
    default: return "shadow-sm";
  }
}

// ---- Typography Utilities ----

export const FONT_FAMILIES = [
  "Inter", "Poppins", "Roboto", "Playfair Display",
  "Space Grotesk", "JetBrains Mono", "DM Sans", "Caveat",
] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

export const FONT_SIZES = ["small", "medium", "large"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

export function getFontSizeClass(size: string | null | undefined): { name: string; bio: string } {
  switch (size) {
    case "small": return { name: "text-xl", bio: "text-xs" };
    case "large": return { name: "text-3xl", bio: "text-base" };
    default: return { name: "text-2xl", bio: "text-sm" };
  }
}

export function getGoogleFontsUrl(family: string): string {
  const safe = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${safe}:wght@400;600;700&display=swap`;
}

// ---- Layout Utilities ----

export const LAYOUTS = ["centered", "left", "card"] as const;
export type LayoutMode = (typeof LAYOUTS)[number];

export function getLayoutClasses(layout: string | null | undefined): { wrapper: string; inner: string } {
  switch (layout) {
    case "left":
      return { wrapper: "items-start text-left", inner: "items-start" };
    case "card":
      return {
        wrapper: "items-center",
        inner: "items-center bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10",
      };
    default:
      return { wrapper: "items-center text-center", inner: "items-center" };
  }
}

// ---- Avatar Utilities ----

export const AVATAR_SHAPES = ["circle", "square", "rounded-square", "none"] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];

export const AVATAR_BORDERS = ["none", "thin", "ring", "glow"] as const;
export type AvatarBorder = (typeof AVATAR_BORDERS)[number];

export function getAvatarShapeClass(shape: string | null | undefined): string {
  switch (shape) {
    case "square": return "rounded-none";
    case "rounded-square": return "rounded-xl";
    case "none": return "hidden";
    default: return "rounded-full";
  }
}

export function getAvatarBorderClass(border: string | null | undefined): string {
  switch (border) {
    case "thin": return "border-2 border-white/50";
    case "ring": return "ring-4 ring-white/30";
    case "glow": return "shadow-[0_0_20px_rgba(255,255,255,0.4)]";
    default: return "";
  }
}
