import { NextRequest, NextResponse } from "next/server";
import { getUserSession, USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const plan = body.plan === "yearly" ? "yearly" : "monthly";

  const secret = process.env.STRIPE_SECRET_KEY;
  const monthly = process.env.STRIPE_PRICE_MONTHLY;
  const yearly = process.env.STRIPE_PRICE_YEARLY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secret || (plan === "monthly" ? !monthly : !yearly)) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  // Identify authenticated user from session cookie or body payload
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  const session = getUserSession(token);
  const userId = session?.userId || (typeof body.userId === "string" ? body.userId : "");
  const userEmail = session?.email || (typeof body.userEmail === "string" ? body.userEmail : "");

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId || undefined,
    customer_email: userEmail && userEmail.includes("@") ? userEmail : undefined,
    metadata: {
      userId: userId || "",
      userEmail: userEmail || "",
      plan,
    },
    line_items: [{ price: plan === "yearly" ? yearly! : monthly!, quantity: 1 }],
    success_url: `${appUrl}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
