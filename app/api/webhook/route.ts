import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseclient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig as string,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const todayDate = new Date().toISOString().split("T")[0];
      const userId = session.metadata?.user_id;

      // Example: save order with session ID
      const { error } = await supabaseclient.from("orders").insert([
        {
          session_id: session.id,
          order_date: todayDate,
          user_id: userId,
        },
      ]);

      if (error) {
        console.error("Error inserting order:", error);
        return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
