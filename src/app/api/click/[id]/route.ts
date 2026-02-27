import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { nowIso, parseDeviceType } from "@/lib/utils";
import type { LinkRow } from "@/lib/db/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const linkId = parseInt(id, 10);
  if (isNaN(linkId)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const link = queryOne<LinkRow>("SELECT * FROM links WHERE id = ? AND is_active = 1", linkId);

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Validate URL scheme before redirecting (defense in depth)
  try {
    const parsed = new URL(link.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Increment click counter
  execute("UPDATE links SET clicks = clicks + 1 WHERE id = ?", linkId);

  // Log click details
  const referrer = request.headers.get("referer") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const device = parseDeviceType(userAgent);
  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "";

  execute("INSERT INTO link_clicks (link_id, referrer, country, device, created_at) VALUES (?, ?, ?, ?, ?)",
    linkId, referrer, country, device, nowIso());

  return NextResponse.redirect(link.url, 302);
}
