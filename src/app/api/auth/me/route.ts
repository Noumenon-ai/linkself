import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/http";
import type { UserRow } from "@/lib/db/schema";

export async function GET() {
  const session = await getServerSession();
  if (!session) return jsonError("Not authenticated", 401);

  const user = queryOne<UserRow>("SELECT id, username, email, display_name, bio, avatar_url, theme, plan FROM users WHERE id = ?", session.userId);

  if (!user) return jsonError("User not found", 404);

  return jsonOk({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.display_name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    theme: user.theme,
    plan: user.plan,
  });
}
