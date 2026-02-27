import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { linkUpdateSchema } from "@/lib/validators";
import { jsonOk, jsonError } from "@/lib/http";
import type { LinkRow } from "@/lib/db/schema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const { id } = await params;
  const linkId = parseInt(id, 10);
  if (isNaN(linkId)) return jsonError("Invalid link ID");

  const link = await queryOne<LinkRow>("SELECT * FROM links WHERE id = ? AND user_id = ?", linkId, session.userId);
  if (!link) return jsonError("Link not found", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = linkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const updates = parsed.data;
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
  if (updates.url !== undefined) { fields.push("url = ?"); values.push(updates.url); }
  if (updates.icon !== undefined) { fields.push("icon = ?"); values.push(updates.icon); }
  if (updates.is_active !== undefined) { fields.push("is_active = ?"); values.push(updates.is_active ? 1 : 0); }
  if (updates.position !== undefined) { fields.push("position = ?"); values.push(updates.position); }
  if (updates.thumbnail_url !== undefined) { fields.push("thumbnail_url = ?"); values.push(updates.thumbnail_url || null); }
  if (updates.bg_color !== undefined) { fields.push("bg_color = ?"); values.push(updates.bg_color); }
  if (updates.text_color !== undefined) { fields.push("text_color = ?"); values.push(updates.text_color); }
  if (updates.shape !== undefined) { fields.push("shape = ?"); values.push(updates.shape); }
  if (updates.nsfw !== undefined) { fields.push("nsfw = ?"); values.push(updates.nsfw ? 1 : 0); }
  if (updates.scheduled_start !== undefined) { fields.push("scheduled_start = ?"); values.push(updates.scheduled_start); }
  if (updates.scheduled_end !== undefined) { fields.push("scheduled_end = ?"); values.push(updates.scheduled_end); }
  if (updates.link_type !== undefined) { fields.push("link_type = ?"); values.push(updates.link_type); }
  if (updates.embed_url !== undefined) { fields.push("embed_url = ?"); values.push(updates.embed_url); }

  if (fields.length > 0) {
    values.push(linkId);
    await execute(`UPDATE links SET ${fields.join(", ")} WHERE id = ?`, ...values);
  }

  const updated = await queryOne<LinkRow>("SELECT * FROM links WHERE id = ?", linkId);
  return jsonOk({ link: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const { id } = await params;
  const linkId = parseInt(id, 10);
  if (isNaN(linkId)) return jsonError("Invalid link ID");

  const link = await queryOne<LinkRow>("SELECT * FROM links WHERE id = ? AND user_id = ?", linkId, session.userId);
  if (!link) return jsonError("Link not found", 404);

  await execute("DELETE FROM link_clicks WHERE link_id = ?", linkId);
  await execute("DELETE FROM links WHERE id = ?", linkId);

  return jsonOk({ success: true });
}
