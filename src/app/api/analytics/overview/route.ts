import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const totalLinks = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM links WHERE user_id = ?", session.userId))?.count ?? 0;

  const totalClicks = (await queryOne<{ total: number }>(
    "SELECT COALESCE(SUM(l.clicks), 0) as total FROM links l WHERE l.user_id = ?",
    session.userId
  ))?.total ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const clicksToday = (await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ?",
    session.userId, today + "T00:00:00.000Z"
  ))?.count ?? 0;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const clicksThisWeek = (await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ?",
    session.userId, weekAgo
  ))?.count ?? 0;

  const topLink = await queryOne<{ title: string; clicks: number }>(
    "SELECT title, clicks FROM links WHERE user_id = ? ORDER BY clicks DESC LIMIT 1",
    session.userId
  );

  return jsonOk({
    totalLinks,
    totalClicks,
    clicksToday,
    clicksThisWeek,
    topLink: topLink ?? null,
  });
}
