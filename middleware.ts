import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/jwt";
import { createCorsHeaders } from "@/lib/http";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS for API routes + preflight support
  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: createCorsHeaders() });
    }

    const response = NextResponse.next();
    const corsHeaders = createCorsHeaders();
    corsHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifyAuthToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyAuthToken(token);
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/register"],
};
