import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { executeBatch } from "@/lib/db";
import { linkReorderSchema } from "@/lib/validators";
import { jsonOk, jsonError } from "@/lib/http";

export async function PUT(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = linkReorderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  try {
    const statements = parsed.data.linkIds.map((linkId, i) => ({
      sql: "UPDATE links SET position = ? WHERE id = ? AND user_id = ?",
      params: [i, linkId, session.userId] as unknown[],
    }));
    await executeBatch(statements);
  } catch {
    return jsonError("Failed to reorder links", 500);
  }

  return jsonOk({ success: true });
}
