import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, queryAll, execute } from "@/lib/db";
import { socialIconSchema } from "@/lib/validators";
import { getPaginationParams, jsonOk, jsonError, paginationMeta } from "@/lib/http";
import { getPlan, isWithinSocialIconLimit } from "@/lib/plans";
import type { SocialIconRow } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const { page, limit, offset } = getPaginationParams(new URL(request.url), 50, 200);
  const total = (await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM social_icons WHERE user_id = ?",
    session.userId
  ))?.count ?? 0;
  const icons = await queryAll<SocialIconRow>(
    "SELECT * FROM social_icons WHERE user_id = ? ORDER BY position ASC LIMIT ? OFFSET ?",
    session.userId,
    limit,
    offset
  );

  return jsonOk(
    { icons },
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

  const parsed = socialIconSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { platform, url } = parsed.data;

  // --- Plan enforcement: social icon limit ---
  const currentUser = await queryOne<{ plan: string }>("SELECT plan FROM users WHERE id = ?", session.userId);
  const plan = getPlan(currentUser?.plan);
  const iconCount = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM social_icons WHERE user_id = ?", session.userId);
  if (!isWithinSocialIconLimit(currentUser?.plan, iconCount?.count ?? 0)) {
    return jsonError(`Free plan allows ${plan.maxSocialIcons} social icons. Upgrade to Pro for unlimited.`, 403);
  }
  // --- End plan enforcement ---

  const last = await queryOne<{ maxPos: number | null }>("SELECT MAX(position) as maxPos FROM social_icons WHERE user_id = ?", session.userId);
  const position = (last?.maxPos ?? -1) + 1;

  const result = await execute("INSERT INTO social_icons (user_id, platform, url, position) VALUES (?, ?, ?, ?)", session.userId, platform, url, position);

  const icon = await queryOne<SocialIconRow>("SELECT * FROM social_icons WHERE id = ?", Number(result.lastInsertRowid));

  return jsonOk({ icon }, 201);
}
