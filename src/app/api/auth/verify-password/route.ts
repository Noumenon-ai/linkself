import { NextRequest } from "next/server";
import { queryOne } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";
import { checkRateLimit, getRequestIp, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`pw-verify:${ip}`, 10, 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.allowed) return jsonError("Too many attempts", 429, { headers });

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, { headers });
  }

  const { username, password } = body;
  if (!username || !password) return jsonError("Missing fields", 400, { headers });

  const user = await queryOne<{ page_password: string | null }>(
    "SELECT page_password FROM users WHERE username = ?",
    username
  );

  if (!user || !user.page_password?.trim()) {
    return jsonError("Not found", 404, { headers });
  }

  if (user.page_password.trim() === password.trim()) {
    return jsonOk({ unlocked: true }, 200, { headers });
  }

  return jsonError("Incorrect password", 401, { headers });
}
