import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { settingsSchema } from "@/lib/validators";
import { jsonOk, jsonError } from "@/lib/http";
import { nowIso } from "@/lib/utils";
import { themes } from "@/lib/themes";
import type { UserRow } from "@/lib/db/schema";

const SETTINGS_FIELDS = [
  "username", "email", "display_name", "bio", "avatar_url", "theme", "custom_css",
  "bg_type", "bg_color", "bg_gradient_from", "bg_gradient_to", "bg_gradient_direction", "bg_image_url",
  "btn_shape", "btn_color", "btn_text_color", "btn_hover", "btn_shadow",
  "font_family", "font_size", "text_color",
  "layout", "avatar_shape", "avatar_border",
  "plan",
] as const;

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const user = queryOne<UserRow>(
    `SELECT ${SETTINGS_FIELDS.join(", ")} FROM users WHERE id = ?`,
    session.userId
  );

  if (!user) return jsonError("User not found", 404);

  const result: Record<string, unknown> = {};
  for (const field of SETTINGS_FIELDS) {
    result[field] = (user as Record<string, unknown>)[field] ?? "";
  }

  return jsonOk(result);
}

const UPDATABLE_FIELDS = [
  "display_name", "bio", "avatar_url", "theme", "custom_css",
  "bg_type", "bg_color", "bg_gradient_from", "bg_gradient_to", "bg_gradient_direction", "bg_image_url",
  "btn_shape", "btn_color", "btn_text_color", "btn_hover", "btn_shadow",
  "font_family", "font_size", "text_color",
  "layout", "avatar_shape", "avatar_border",
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
  const fields: string[] = [];
  const values: unknown[] = [];

  // Handle username change (check uniqueness)
  if (updates.username !== undefined) {
    const existing = queryOne<{ id: number }>(
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

  // Handle all other fields
  for (const field of UPDATABLE_FIELDS) {
    if (field === "username") continue; // Already handled above
    const val = (updates as Record<string, unknown>)[field];
    if (val !== undefined) {
      fields.push(`${field} = ?`);
      values.push(val);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = ?");
    values.push(nowIso());
    values.push(session.userId);
    execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, ...values);
  }

  return jsonOk({ success: true });
}
