import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { execute } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";
import { nowIso } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const file = formData.get("avatar") as File | null;
  if (!file) return jsonError("No file provided");

  if (file.size > 2 * 1024 * 1024) return jsonError("File too large (max 2MB)");
  if (!file.type.startsWith("image/")) return jsonError("Only images allowed");

  const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) return jsonError("Only PNG, JPG, GIF, and WebP images are allowed");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  await execute(
    "UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?",
    base64, nowIso(), session.userId
  );

  return jsonOk({ avatar_url: base64 });
}
