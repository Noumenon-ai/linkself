import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";
import type { SocialIconRow } from "@/lib/db/schema";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const { id } = await params;
  const iconId = parseInt(id, 10);
  if (isNaN(iconId)) return jsonError("Invalid icon ID");

  const icon = queryOne<SocialIconRow>("SELECT * FROM social_icons WHERE id = ? AND user_id = ?", iconId, session.userId);
  if (!icon) return jsonError("Social icon not found", 404);

  execute("DELETE FROM social_icons WHERE id = ?", iconId);

  return jsonOk({ success: true });
}
