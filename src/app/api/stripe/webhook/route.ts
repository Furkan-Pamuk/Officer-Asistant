import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature") ?? "";
  const buf = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || "monthly";
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

        if (supabaseAdmin && userId) {
          await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            plan: plan === "yearly" ? "yearly" : "monthly",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const subObj = sub as unknown as { current_period_end?: number };
        const status = sub.status;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;
        const isPlanActive = status === "active" || status === "trialing";
        const periodEnd =
          typeof subObj.current_period_end === "number"
            ? new Date(subObj.current_period_end * 1000).toISOString()
            : null;

        if (supabaseAdmin && customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: isPlanActive ? "monthly" : "free",
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;

        if (supabaseAdmin && customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        // Ignore unhandled event types cleanly
        break;
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err: unknown) {
    console.error("[stripe-webhook] Error processing event:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
