import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken, type AuthTokenPayload } from "./jwt";

export async function createSessionToken(payload: AuthTokenPayload): Promise<string> {
  return signAuthToken(payload);
}

export async function setAuthCookie(payload: AuthTokenPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getServerSession(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function getRequestSession(request: Request): Promise<AuthTokenPayload | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyAuthToken(match[1]);
}
