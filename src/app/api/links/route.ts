import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, queryAll, execute } from "@/lib/db";
import { linkCreateSchema } from "@/lib/validators";
import { getPaginationParams, jsonOk, jsonError, paginationMeta } from "@/lib/http";
import { nowIso } from "@/lib/utils";
import { getPlan, isWithinLinkLimit, BLOCK_TYPE_FEATURE_MAP, canUseFeature } from "@/lib/plans";
import type { LinkRow } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const { page, limit, offset } = getPaginationParams(new URL(request.url), 50, 200);
  const total = (await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM links WHERE user_id = ?",
    session.userId
  ))?.count ?? 0;
  const links = await queryAll<LinkRow>(
    "SELECT * FROM links WHERE user_id = ? ORDER BY position ASC LIMIT ? OFFSET ?",
    session.userId,
    limit,
    offset
  );

  return jsonOk(
    { links },
    200,
    { meta: { pagination: paginationMeta(page, limit, total) } }
  );
}

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = linkCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  // --- Plan enforcement ---
  const currentUser = await queryOne<{ plan: string }>("SELECT plan FROM users WHERE id = ?", session.userId);
  const plan = getPlan(currentUser?.plan);

  // Check link count against plan limit
  const countResult = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM links WHERE user_id = ?", session.userId);
  if (!isWithinLinkLimit(currentUser?.plan, countResult?.count ?? 0)) {
    return jsonError(`Free plan allows ${plan.maxLinks} links. Upgrade to Pro for unlimited links.`, 403);
  }

  // Check block type permission
  const requestedType = parsed.data.link_type || "link";
  const requiredFeature = BLOCK_TYPE_FEATURE_MAP[requestedType];
  if (requiredFeature && !canUseFeature(currentUser?.plan, requiredFeature)) {
    return jsonError(`${requestedType} blocks require a Pro plan. Upgrade to unlock.`, 403);
  }

  // Check pinned link permission
  if (parsed.data.is_pinned && !canUseFeature(currentUser?.plan, "pinnedLinks")) {
    return jsonError("Pinned links require a Pro plan. Upgrade to unlock.", 403);
  }

  // Check scheduling permission
  if ((parsed.data.scheduled_start || parsed.data.scheduled_end) && !canUseFeature(currentUser?.plan, "scheduling")) {
    return jsonError("Link scheduling requires a Pro plan. Upgrade to unlock.", 403);
  }

  // Check UTM permission
  if ((parsed.data.utm_source || parsed.data.utm_medium || parsed.data.utm_campaign) && !canUseFeature(currentUser?.plan, "utmBuilder")) {
    return jsonError("UTM parameters require a Pro plan. Upgrade to unlock.", 403);
  }
  // --- End plan enforcement ---

  const { title, url, icon, thumbnail_url, bg_color, text_color, shape, nsfw, scheduled_start, scheduled_end, link_type, embed_url, block_config, utm_source, utm_medium, utm_campaign, is_pinned } = parsed.data;

  // Get next position
  const last = await queryOne<{ maxPos: number | null }>("SELECT MAX(position) as maxPos FROM links WHERE user_id = ?", session.userId);
  const position = (last?.maxPos ?? -1) + 1;

  const now = nowIso();
  const result = await execute(
    "INSERT INTO links (user_id, title, url, icon, thumbnail_url, position, clicks, is_active, bg_color, text_color, shape, nsfw, scheduled_start, scheduled_end, link_type, embed_url, block_config, utm_source, utm_medium, utm_campaign, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    session.userId, title, url ?? "", icon ?? "", thumbnail_url ?? null, position, bg_color ?? "", text_color ?? "", shape ?? "", nsfw ? 1 : 0, scheduled_start ?? "", scheduled_end ?? "", link_type ?? "link", embed_url ?? "", block_config ?? "", utm_source ?? "", utm_medium ?? "", utm_campaign ?? "", is_pinned ? 1 : 0, now
  );

  const link = await queryOne<LinkRow>("SELECT * FROM links WHERE id = ?", Number(result.lastInsertRowid));

  return jsonOk({ link }, 201);
}
