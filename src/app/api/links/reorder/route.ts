import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
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

  const db = getDb();
  const updateStmt = db.prepare("UPDATE links SET position = ? WHERE id = ? AND user_id = ?");

  try {
    db.exec("BEGIN");
    for (let i = 0; i < parsed.data.linkIds.length; i++) {
      updateStmt.run(i, parsed.data.linkIds[i], session.userId);
    }
    db.exec("COMMIT");
  } catch {
    db.exec("ROLLBACK");
    return jsonError("Failed to reorder links", 500);
  }

  return jsonOk({ success: true });
}
