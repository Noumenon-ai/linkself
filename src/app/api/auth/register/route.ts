import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne, execute } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { setAuthCookie } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/http";
import { nowIso } from "@/lib/utils";
import { checkRateLimit, getRequestIp, rateLimitHeaders } from "@/lib/rate-limit";
import type { UserRow } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`register:${ip}`, 5, 60_000);
  const headers = rateLimitHeaders(rateLimit);
  const rateLimitMeta = {
    rateLimit: {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
    },
  };
  if (!rateLimit.allowed) {
    return jsonError(
      { code: "RATE_LIMITED", message: "Too many requests. Try again later." },
      429,
      { meta: rateLimitMeta, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError({ code: "INVALID_JSON", message: "Invalid JSON" }, 400, { meta: rateLimitMeta, headers });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      },
      422,
      { meta: rateLimitMeta, headers }
    );
  }

  const { username, email, password, displayName } = parsed.data;

  const existingUser = queryOne<UserRow>("SELECT id FROM users WHERE email = ? OR username = ?", email, username);
  if (existingUser) {
    return jsonError(
      { code: "ACCOUNT_CONFLICT", message: "Email or username already taken" },
      409,
      { meta: rateLimitMeta, headers }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = nowIso();

  const result = execute(
    "INSERT INTO users (email, password_hash, username, display_name, bio, theme, plan, created_at, updated_at) VALUES (?, ?, ?, ?, '', 'default', 'free', ?, ?)",
    email, passwordHash, username, displayName, now, now
  );

  const userId = Number(result.lastInsertRowid);

  await setAuthCookie({ userId, email, username });

  return jsonOk(
    { userId, username, email, displayName },
    201,
    { meta: rateLimitMeta, headers }
  );
}
