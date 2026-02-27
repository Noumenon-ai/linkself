import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { settingsSchema } from "@/lib/validators";
import { jsonOk, jsonError } from "@/lib/http";
import { nowIso } from "@/lib/utils";
import { themes } from "@/lib/themes";
import { getPlan, canUseFeature, isThemeAvailable, isAdmin } from "@/lib/plans";
import type { UserRow } from "@/lib/db/schema";

const SETTINGS_FIELDS = [
  "username", "email", "display_name", "bio", "avatar_url", "theme", "custom_css",
  "bg_type", "bg_color", "bg_gradient_from", "bg_gradient_to", "bg_gradient_direction", "bg_image_url",
  "btn_shape", "btn_color", "btn_text_color", "btn_hover", "btn_shadow",
  "font_family", "font_size", "text_color",
  "layout", "avatar_shape", "avatar_border",
  "nsfw", "tip_enabled", "tip_text", "tip_url",
  "seo_title", "seo_description", "og_image_url", "hide_from_search",
  "link_animation", "social_position",
  "ga_measurement_id", "fb_pixel_id", "tiktok_pixel_id",
  "page_password",
  "plan",
] as const;

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const user = await queryOne<UserRow>(
    `SELECT ${SETTINGS_FIELDS.join(", ")} FROM users WHERE id = ?`,
    session.userId
  );

  if (!user) return jsonError("User not found", 404);

  const result: Record<string, unknown> = {};
  for (const field of SETTINGS_FIELDS) {
    result[field] = (user as unknown as Record<string, unknown>)[field] ?? "";
  }

  // Admin users always get business plan
  if (isAdmin(String(result.username))) {
    result.plan = "business";
  }

  return jsonOk(result);
}

const UPDATABLE_FIELDS = [
  "display_name", "bio", "avatar_url", "theme", "custom_css",
  "bg_type", "bg_color", "bg_gradient_from", "bg_gradient_to", "bg_gradient_direction", "bg_image_url",
  "btn_shape", "btn_color", "btn_text_color", "btn_hover", "btn_shadow",
  "font_family", "font_size", "text_color",
  "layout", "avatar_shape", "avatar_border",
  "nsfw", "tip_enabled", "tip_text", "tip_url",
  "seo_title", "seo_description", "og_image_url", "hide_from_search",
  "link_animation", "social_position",
  "ga_measurement_id", "fb_pixel_id", "tiktok_pixel_id",
  "page_password",
  "username",
] as const;

export async function PATCH(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const updates = parsed.data;

  // --- Plan enforcement ---
  const currentUser = await queryOne<{ plan: string; username: string }>("SELECT plan, username FROM users WHERE id = ?", session.userId);
  const effectivePlan = isAdmin(currentUser?.username ?? "") ? "business" : currentUser?.plan;

  if ((updates as Record<string, unknown>).custom_css && !canUseFeature(effectivePlan, "customCss")) {
    return jsonError("Custom CSS requires a Pro plan. Upgrade to unlock.", 403);
  }
  if ((updates as Record<string, unknown>).ga_measurement_id && !canUseFeature(effectivePlan, "gaPixel")) {
    return jsonError("Google Analytics requires a Business plan. Upgrade to unlock.", 403);
  }
  if ((updates as Record<string, unknown>).fb_pixel_id && !canUseFeature(effectivePlan, "fbPixel")) {
    return jsonError("Facebook Pixel requires a Business plan. Upgrade to unlock.", 403);
  }
  if ((updates as Record<string, unknown>).tiktok_pixel_id && !canUseFeature(effectivePlan, "tiktokPixel")) {
    return jsonError("TikTok Pixel requires a Business plan. Upgrade to unlock.", 403);
  }
  if ((updates as Record<string, unknown>).page_password && !canUseFeature(effectivePlan, "passwordProtection")) {
    return jsonError("Password protection requires a Business plan. Upgrade to unlock.", 403);
  }
  if ((updates as Record<string, unknown>).seo_title || (updates as Record<string, unknown>).seo_description || (updates as Record<string, unknown>).og_image_url) {
    if (!canUseFeature(effectivePlan, "seoControls")) {
      return jsonError("SEO controls require a Pro plan. Upgrade to unlock.", 403);
    }
  }
  if ((updates as Record<string, unknown>).link_animation && (updates as Record<string, unknown>).link_animation !== "fade-in" && (updates as Record<string, unknown>).link_animation !== "none") {
    if (!canUseFeature(effectivePlan, "linkAnimations")) {
      return jsonError("Custom link animations require a Pro plan. Upgrade to unlock.", 403);
    }
  }
  if (updates.theme !== undefined && !isThemeAvailable(effectivePlan, updates.theme)) {
    return jsonError("This theme requires a Pro plan. Upgrade to unlock.", 403);
  }
  const bgTypeVal = (updates as Record<string, unknown>).bg_type;
  if (bgTypeVal === "video" && !canUseFeature(effectivePlan, "videoBackground")) {
    return jsonError("Video backgrounds require a Pro plan. Upgrade to unlock.", 403);
  }
  if (bgTypeVal === "pattern" && !canUseFeature(effectivePlan, "patternBackground")) {
    return jsonError("Pattern backgrounds require a Pro plan. Upgrade to unlock.", 403);
  }
  // --- End plan enforcement ---

  const fields: string[] = [];
  const values: unknown[] = [];

  // Handle username change (check uniqueness)
  if (updates.username !== undefined) {
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      updates.username, session.userId
    );
    if (existing) return jsonError("Username already taken");
    fields.push("username = ?");
    values.push(updates.username);
  }

  // Handle theme validation
  if (updates.theme !== undefined) {
    if (!themes[updates.theme]) return jsonError("Invalid theme");
  }

  // Boolean fields that need integer conversion for SQLite
  // Note: nsfw is now an integer (0/1/2), not boolean, so it's excluded
  const BOOLEAN_FIELDS = new Set(["tip_enabled", "hide_from_search"]);

  // Handle all other fields
  for (const field of UPDATABLE_FIELDS) {
    if (field === "username") continue; // Already handled above
    const val = (updates as Record<string, unknown>)[field];
    if (val !== undefined) {
      fields.push(`${field} = ?`);
      values.push(BOOLEAN_FIELDS.has(field) ? (val ? 1 : 0) : val);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = ?");
    values.push(nowIso());
    values.push(session.userId);
    await execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, ...values);
  }

  return jsonOk({ success: true });
}
