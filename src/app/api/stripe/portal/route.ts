import { NextRequest, NextResponse } from "next/server";
import { getUserSession, USER_COOKIE_NAME } from "@/lib/user-auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  const session = getUserSession(token);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let customerId: string | null = null;

  if (url && serviceKey) {
    const supabaseAdmin = createClient(url, serviceKey);
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", session.userId)
      .single();
    customerId = data?.stripe_customer_id ?? null;
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "No active Stripe customer found for this account." },
      { status: 404 }
    );
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
