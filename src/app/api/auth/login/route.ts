import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { setAuthCookie } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/http";
import { checkRateLimit, getRequestIp, rateLimitHeaders } from "@/lib/rate-limit";
import type { UserRow } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 60_000);
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
      { code: "RATE_LIMITED", message: "Too many attempts. Try again later." },
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

  const parsed = loginSchema.safeParse(body);
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

  const { email, password } = parsed.data;

  const user = queryOne<UserRow>("SELECT * FROM users WHERE email = ?", email);
  if (!user) {
    return jsonError(
      { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      401,
      { meta: rateLimitMeta, headers }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return jsonError(
      { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      401,
      { meta: rateLimitMeta, headers }
    );
  }

  await setAuthCookie({ userId: user.id, email: user.email, username: user.username });

  return jsonOk(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
    },
    200,
    { meta: rateLimitMeta, headers }
  );
}
