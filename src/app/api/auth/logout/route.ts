import { clearAuthCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function POST() {
  await clearAuthCookie();
  return jsonOk({ success: true });
}
