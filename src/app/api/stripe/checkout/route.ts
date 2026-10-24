import { NextRequest, NextResponse } from "next/server";
import { getUserSession, USER_COOKIE_NAME } from "@/lib/user-auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str: string): string {
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const plan = body.plan;

  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json(
      { error: "Invalid plan. Only 'monthly' and 'yearly' are permitted." },
      { status: 400 }
    );
  }

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
  const rawUserId = session?.userId || (typeof body.userId === "string" ? body.userId : "");
  const rawEmail = session?.email || (typeof body.userEmail === "string" ? body.userEmail : "");

  const userId = sanitize(rawUserId);
  const userEmail = sanitize(rawEmail).toLowerCase();

  if (userEmail && !EMAIL_REGEX.test(userEmail)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  const validEmail = userEmail && EMAIL_REGEX.test(userEmail) ? userEmail : undefined;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId || undefined,
    customer_email: validEmail,
    metadata: {
      userId: userId || "",
      userEmail: validEmail || "",
      plan,
    },
    line_items: [{ price: plan === "yearly" ? yearly! : monthly!, quantity: 1 }],
    success_url: `${appUrl}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
