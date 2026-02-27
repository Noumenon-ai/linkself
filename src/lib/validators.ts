import { z } from "zod";

const RESERVED_USERNAMES = [
  "admin", "api", "dashboard", "login", "register", "settings",
  "help", "support", "about", "terms", "privacy", "pricing",
  "blog", "docs", "app", "www", "mail", "ftp", "static",
];

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const absoluteUrlSchema = z.string().url();

function isHttpUrl(value: string): boolean {
  try { return ["http:", "https:"].includes(new URL(value).protocol); }
  catch { return false; }
}

const httpUrlSchema = z
  .string()
  .trim()
  .url("Invalid URL")
  .max(2000)
  .refine(isHttpUrl, "URL must use http or https");

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
    .refine((v) => !RESERVED_USERNAMES.includes(v), "This username is reserved"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().trim().min(1, "Display name is required").max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const linkCreateSchema = z.object({
  title: z.string().trim().max(100).optional().default(""),
  url: httpUrlSchema.or(z.literal("")).optional().default(""),
  icon: z.string().max(50).optional().default(""),
  thumbnail_url: z.string().trim().max(2000).refine((v) => v === "" || (absoluteUrlSchema.safeParse(v).success && isHttpUrl(v)), "Invalid URL").optional().default(""),
  bg_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid color").optional().default(""),
  text_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid color").optional().default(""),
  shape: z.enum(["", "rounded", "pill", "square", "outline"]).optional().default(""),
  nsfw: z.boolean().optional().default(false),
  scheduled_start: z.string().optional().or(z.literal("")),
  scheduled_end: z.string().optional().or(z.literal("")),
  link_type: z.enum(["link", "header", "divider", "embed", "email-collector", "countdown", "contact-form", "faq", "image-gallery", "testimonial", "map"]).optional().default("link"),
  embed_url: z.string().trim().max(2000).optional().default(""),
  block_config: z.string().max(10000).optional(),
  // UTM parameters
  utm_source: z.string().trim().max(200).optional().default(""),
  utm_medium: z.string().trim().max(200).optional().default(""),
  utm_campaign: z.string().trim().max(200).optional().default(""),
  // Pinned
  is_pinned: z.boolean().optional().default(false),
});

export const linkUpdateSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  url: httpUrlSchema.optional(),
  icon: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  thumbnail_url: z.string().trim().max(2000).refine((v) => v === "" || (absoluteUrlSchema.safeParse(v).success && isHttpUrl(v)), "Invalid URL").optional(),
  bg_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid color").optional(),
  text_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid color").optional(),
  shape: z.enum(["", "rounded", "pill", "square", "outline"]).optional(),
  nsfw: z.boolean().optional(),
  scheduled_start: z.string().optional().or(z.literal("")),
  scheduled_end: z.string().optional().or(z.literal("")),
  link_type: z.enum(["link", "header", "divider", "embed", "email-collector", "countdown", "contact-form", "faq", "image-gallery", "testimonial", "map"]).optional(),
  embed_url: z.string().trim().max(2000).optional(),
  block_config: z.string().max(10000).optional(),
  // UTM parameters
  utm_source: z.string().trim().max(200).optional(),
  utm_medium: z.string().trim().max(200).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  // Pinned
  is_pinned: z.boolean().optional(),
});

export const linkReorderSchema = z.object({
  linkIds: z.array(z.number().int().positive()),
});

export const settingsSchema = z.object({
  display_name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(280).optional(),
  avatar_url: z.string().trim().max(3_000_000).refine(
    (v) => v === "" || v.startsWith("data:image/") || (absoluteUrlSchema.safeParse(v).success && isHttpUrl(v)),
    "Must be a valid image URL or data URL"
  ).optional().nullable(),
  theme: z.string().max(50).optional(),
  custom_css: z.string().max(5000).optional(),
  bg_type: z.enum(["theme", "solid", "gradient", "image", "video", "pattern"]).optional(),
  bg_color: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) => value === "" || HEX_COLOR_REGEX.test(value) || /^pattern:\w+$/.test(value),
      "Invalid background color or pattern"
    )
    .optional(),
  bg_gradient_from: z
    .string()
    .trim()
    .max(7)
    .refine((value) => value === "" || HEX_COLOR_REGEX.test(value), "Invalid gradient color")
    .optional(),
  bg_gradient_to: z
    .string()
    .trim()
    .max(7)
    .refine((value) => value === "" || HEX_COLOR_REGEX.test(value), "Invalid gradient color")
    .optional(),
  bg_gradient_direction: z.enum(["top-bottom", "left-right", "diagonal"]).optional(),
  bg_image_url: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => value === "" || (absoluteUrlSchema.safeParse(value).success && isHttpUrl(value)), "Invalid image URL")
    .optional(),
  // Button customization
  btn_shape: z.enum(["rounded", "pill", "square", "outline"]).optional(),
  btn_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid button color").optional(),
  btn_text_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid button text color").optional(),
  btn_hover: z.enum(["scale", "glow", "slide", "none"]).optional(),
  btn_shadow: z.enum(["none", "soft", "hard"]).optional(),
  // Typography
  font_family: z.enum(["Inter", "Poppins", "Roboto", "Playfair Display", "Space Grotesk", "JetBrains Mono", "DM Sans", "Caveat"]).optional(),
  font_size: z.enum(["small", "medium", "large"]).optional(),
  text_color: z.string().trim().max(7).refine((v) => v === "" || HEX_COLOR_REGEX.test(v), "Invalid text color").optional(),
  // Layout
  layout: z.enum(["centered", "left", "card"]).optional(),
  avatar_shape: z.enum(["circle", "square", "rounded-square", "none"]).optional(),
  avatar_border: z.enum(["none", "thin", "ring", "glow"]).optional(),
  // NSFW (0 = off, 1 = entire profile, 2 = individual links only)
  nsfw: z.number().int().min(0).max(2).optional(),
  // Tip jar
  tip_enabled: z.boolean().optional(),
  tip_text: z.string().trim().max(100).optional(),
  tip_url: z.string().trim().max(2000).refine((v) => v === "" || isHttpUrl(v), "Must be a valid URL").optional(),
  // Username change
  username: z.string().trim().min(3).max(30).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens").refine((v) => !RESERVED_USERNAMES.includes(v), "Reserved").optional(),
  // SEO & Meta
  seo_title: z.string().trim().max(120).optional(),
  seo_description: z.string().trim().max(300).optional(),
  og_image_url: z.string().trim().max(2000).refine((v) => v === "" || (absoluteUrlSchema.safeParse(v).success && isHttpUrl(v)), "Invalid image URL").optional(),
  hide_from_search: z.boolean().optional(),
  // Appearance: Animation & Social Position
  link_animation: z.enum(["none", "fade-in", "slide-up", "bounce", "stagger"]).optional(),
  social_position: z.enum(["top", "bottom"]).optional(),
  // Tracking & Analytics
  ga_measurement_id: z.string().trim().max(30).optional(),
  fb_pixel_id: z.string().trim().max(30).optional(),
  tiktok_pixel_id: z.string().trim().max(30).optional(),
  // Password protection
  page_password: z.string().max(100).optional(),
});

export const socialIconSchema = z.object({
  platform: z.string().trim().min(1, "Platform is required").max(50),
  url: httpUrlSchema,
});
