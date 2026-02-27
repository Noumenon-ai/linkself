import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, queryAll } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const uid = session.userId;

  // --- Core counts ---
  const totalLinks =
    (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM links WHERE user_id = ?", uid))?.count ?? 0;

  const totalClicks =
    (await queryOne<{ total: number }>(
      "SELECT COALESCE(SUM(l.clicks), 0) as total FROM links l WHERE l.user_id = ?",
      uid
    ))?.total ?? 0;

  // --- Time boundaries ---
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  // --- Clicks this period ---
  const clicksToday =
    (await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ?",
      uid,
      today + "T00:00:00.000Z"
    ))?.count ?? 0;

  const clicksThisWeek =
    (await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ?",
      uid,
      weekAgo
    ))?.count ?? 0;

  // --- Previous week clicks (for trend calculation) ---
  const clicksPrevWeek =
    (await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ? AND lc.created_at < ?",
      uid,
      twoWeeksAgo,
      weekAgo
    ))?.count ?? 0;

  // Trend: percent change vs previous period
  const clicksTrend =
    clicksPrevWeek === 0
      ? clicksThisWeek > 0
        ? 100
        : 0
      : Math.round(((clicksThisWeek - clicksPrevWeek) / clicksPrevWeek) * 100);

  // --- Unique visitors (distinct link_id + device + country combos as proxy) ---
  const uniqueVisitors =
    (await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT lc.referrer || lc.device || lc.country) as count FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.user_id = ? AND lc.created_at >= ?",
      uid,
      weekAgo
    ))?.count ?? 0;

  // --- Views (use total clicks as proxy for page views) ---
  const viewsToday = clicksToday;
  const viewsThisWeek = clicksThisWeek;

  // --- CTR (clicks / links, as a simple metric) ---
  const ctr = totalLinks > 0 ? Math.round((totalClicks / totalLinks) * 10) / 10 : 0;

  // --- Top link ---
  const topLink = await queryOne<{ title: string; clicks: number }>(
    "SELECT title, clicks FROM links WHERE user_id = ? ORDER BY clicks DESC LIMIT 1",
    uid
  );

  // --- Top Referrer ---
  const topReferrer = await queryOne<{ referrer: string; count: number }>(
    `SELECT CASE WHEN lc.referrer = '' THEN 'Direct' ELSE lc.referrer END as referrer, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY referrer ORDER BY count DESC LIMIT 1`,
    uid,
    weekAgo
  );

  // --- Top Country ---
  const topCountry = await queryOne<{ country: string; count: number }>(
    `SELECT CASE WHEN lc.country = '' THEN 'Unknown' ELSE lc.country END as country, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY country ORDER BY count DESC LIMIT 1`,
    uid,
    weekAgo
  );

  // --- Top Device ---
  const topDevice = await queryOne<{ device: string; count: number }>(
    `SELECT CASE WHEN lc.device = '' THEN 'Unknown' ELSE lc.device END as device, COUNT(*) as count
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY device ORDER BY count DESC LIMIT 1`,
    uid,
    weekAgo
  );

  // --- Daily clicks for sparkline (last 7 days) ---
  const byDayRaw = await queryAll<{ date: string; clicks: number }>(
    `SELECT DATE(lc.created_at) as date, COUNT(*) as clicks
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY DATE(lc.created_at)
     ORDER BY date ASC`,
    uid,
    weekAgo
  );

  const dayMap = new Map(byDayRaw.map((d) => [d.date, d.clicks]));
  const dailyClicks: { date: string; clicks: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dailyClicks.push({ date: d, clicks: dayMap.get(d) ?? 0 });
  }

  // --- Top 5 performing links ---
  const topLinks = await queryAll<{ title: string; clicks: number }>(
    `SELECT l.title, COUNT(lc.id) as clicks
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ? AND lc.created_at >= ?
     GROUP BY l.id ORDER BY clicks DESC LIMIT 5`,
    uid,
    weekAgo
  );

  // --- Recent 10 clicks with link title ---
  const recentClicks = await queryAll<{
    link_title: string;
    referrer: string;
    country: string;
    device: string;
    created_at: string;
  }>(
    `SELECT lc.referrer, lc.country, lc.device, lc.created_at, l.title as link_title
     FROM link_clicks lc JOIN links l ON lc.link_id = l.id
     WHERE l.user_id = ?
     ORDER BY lc.created_at DESC LIMIT 10`,
    uid
  );

  return jsonOk({
    totalLinks,
    totalClicks,
    clicksToday,
    clicksThisWeek,
    clicksTrend,
    viewsToday,
    viewsThisWeek,
    uniqueVisitors,
    ctr,
    topLink: topLink ?? null,
    topReferrer: topReferrer ?? null,
    topCountry: topCountry ?? null,
    topDevice: topDevice ?? null,
    dailyClicks,
    topLinks,
    recentClicks,
  });
}
