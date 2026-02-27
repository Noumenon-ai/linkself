import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { jsonError } from "@/lib/http";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://linkself-black.vercel.app";

const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
  },
  business: {
    monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",
  },
};

async function directUpgrade(userId: number, plan: string) {
  await execute("UPDATE users SET plan = ? WHERE id = ?", plan, userId);
  return NextResponse.redirect(
    `${APP_URL}/dashboard/settings?upgraded=${plan}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadStripe(): Promise<any | null> {
  try {
    // Dynamic require to avoid compile-time dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("stripe");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

async function handleCheckout(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Not authenticated", 401);

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") as string;
  const interval = url.searchParams.get("interval") || "monthly";

  if (!plan || !PRICE_IDS[plan]) {
    return jsonError("Invalid plan", 400);
  }

  // If Stripe is not configured, do a direct plan upgrade (for testing / dev)
  if (!STRIPE_SECRET) {
    return directUpgrade(session.userId, plan);
  }

  const priceId = PRICE_IDS[plan][interval as "monthly" | "yearly"];

  if (!priceId) {
    // No price ID configured for this plan/interval => direct upgrade (testing)
    return directUpgrade(session.userId, plan);
  }

  // Try to load Stripe
  const Stripe = await loadStripe();
  if (!Stripe) {
    // stripe package not installed — do direct upgrade
    return directUpgrade(session.userId, plan);
  }

  const stripeClient = new Stripe(STRIPE_SECRET);

  const user = await queryOne<{ email: string }>(
    "SELECT email FROM users WHERE id = ?",
    session.userId
  );

  const checkoutSession = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user?.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/settings?upgraded=${plan}`,
    cancel_url: `${APP_URL}/pricing`,
    metadata: { userId: String(session.userId), plan },
  });

  return NextResponse.redirect(checkoutSession.url!);
}

export async function POST(request: NextRequest) {
  return handleCheckout(request);
}

// GET is needed for the <a href> upgrade flow - redirects to Stripe
export async function GET(request: NextRequest) {
  // In production with Stripe configured, this redirects to Stripe checkout (safe)
  // Without Stripe, prevent GET-based state changes in production
  if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    return jsonError("Use POST to upgrade", 405);
  }
  return handleCheckout(request);
}
