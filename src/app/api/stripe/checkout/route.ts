import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan } = await req.json().catch(() => ({ plan: "monthly" }));
  const secret = process.env.STRIPE_SECRET_KEY;
  const monthly = process.env.STRIPE_PRICE_MONTHLY;
  const yearly = process.env.STRIPE_PRICE_YEARLY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secret || (plan === "monthly" ? !monthly : !yearly)) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan === "yearly" ? yearly! : monthly!, quantity: 1 }],
    success_url: `${appUrl}/pricing?success=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });
  return NextResponse.json({ url: session.url });
}
