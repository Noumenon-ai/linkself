import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryAll } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? "7d";
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Clicks by day
  const byDay = queryAll<{ date: string; clicks: number }>(
    `SELECT DATE(lc.created_at) as date, COUNT(*) as clicks
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY DATE(lc.created_at)
     ORDER BY date ASC`,
    session.userId, since
  );

  // Fill in missing days
  const dayMap = new Map(byDay.map((d) => [d.date, d.clicks]));
  const filledDays: { date: string; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    filledDays.push({ date: d, clicks: dayMap.get(d) ?? 0 });
  }

  // By referrer
  const byReferrer = queryAll<{ referrer: string; count: number }>(
    `SELECT CASE WHEN lc.referrer = '' THEN 'Direct' ELSE lc.referrer END as referrer, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY referrer ORDER BY count DESC LIMIT 10`,
    session.userId, since
  );

  // By device
  const byDevice = queryAll<{ device: string; count: number }>(
    `SELECT CASE WHEN lc.device = '' THEN 'Unknown' ELSE lc.device END as device, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY device ORDER BY count DESC`,
    session.userId, since
  );

  // By country
  const byCountry = queryAll<{ country: string; count: number }>(
    `SELECT CASE WHEN lc.country = '' THEN 'Unknown' ELSE lc.country END as country, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY country ORDER BY count DESC LIMIT 10`,
    session.userId, since
  );

  // Top links
  const topLinks = queryAll<{ title: string; clicks: number }>(
    `SELECT l.title, COUNT(lc.id) as clicks
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY l.id ORDER BY clicks DESC LIMIT 10`,
    session.userId, since
  );

  return jsonOk({ days: filledDays, byReferrer, byDevice, byCountry, topLinks });
}
