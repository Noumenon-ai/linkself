import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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

export async function POST(request: NextRequest) {
  // If Stripe is not configured, acknowledge the webhook silently
  if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const Stripe = await loadStripe();
  if (!Stripe) {
    // stripe package not installed
    return NextResponse.json({ received: true });
  }

  const stripeClient = new Stripe(STRIPE_SECRET);

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle checkout completion — upgrade user plan
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { userId?: string; plan?: string };
      subscription?: string;
    };
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    if (userId && plan) {
      await execute(
        "UPDATE users SET plan = ? WHERE id = ?",
        plan,
        parseInt(userId)
      );
      // Copy metadata to the subscription so cancellation webhook can find the user
      if (session.subscription) {
        try {
          await stripeClient.subscriptions.update(session.subscription, {
            metadata: { userId, plan },
          });
        } catch {
          // Non-critical: subscription metadata update failed
        }
      }
    }
  }

  // Handle subscription cancellation — downgrade to free
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as {
      metadata?: { userId?: string };
    };
    const userId = subscription.metadata?.userId;
    if (userId) {
      await execute(
        "UPDATE users SET plan = ? WHERE id = ?",
        "free",
        parseInt(userId)
      );
    }
  }

  return NextResponse.json({ received: true });
}
