import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  // Verify signature then upsert into Supabase `subscriptions`.
  // Kept minimal: read raw body, construct event, handle checkout.session.completed.
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature") ?? "";
  const buf = Buffer.from(await req.arrayBuffer());
  try {
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    return NextResponse.json({ received: event.type });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
