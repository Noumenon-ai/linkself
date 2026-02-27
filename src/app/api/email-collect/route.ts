import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";
import { z } from "zod";
import { checkRateLimit, getRequestIp, rateLimitHeaders } from "@/lib/rate-limit";

const schema = z.object({
  linkId: z.number().int().positive(),
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`email-collect:${ip}`, 20, 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.allowed) return jsonError("Too many attempts", 429, { headers });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, { headers });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validation failed", 422, { headers });
  }

  const { linkId, email } = parsed.data;

  // Verify the link exists and is an email-collector type
  const link = await queryOne<{ id: number; user_id: number; link_type: string }>(
    "SELECT id, user_id, link_type FROM links WHERE id = ? AND is_active = 1",
    linkId
  );

  if (!link || link.link_type !== "email-collector") {
    return jsonError("Invalid link", 404, { headers });
  }

  // Check for duplicate
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM email_subscriptions WHERE link_id = ? AND email = ?",
    linkId,
    email
  );

  if (!existing) {
    await execute(
      "INSERT INTO email_subscriptions (link_id, user_id, email, created_at) VALUES (?, ?, ?, ?)",
      linkId,
      link.user_id,
      email,
      new Date().toISOString()
    );
  }

  return jsonOk({ subscribed: true }, 200, { headers });
}
