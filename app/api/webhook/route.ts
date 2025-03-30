import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
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
      
      // Retrieve full session with shipping details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['shipping_details.address']
      });

      const userId = session.metadata?.user_id;
      const shippingAddress = fullSession.shipping_details?.address;

      // Calculate delivery date (similar to GET endpoint)
      const baseDelivery = new Date();
      baseDelivery.setDate(baseDelivery.getDate() + 14);

      // Insert order with shipping address
      const { error } = await supabaseAdmin.from("orders").insert([{
        session_id: session.id,
        user_id: userId,
        order_date: new Date().toISOString(),
        shipping_address: shippingAddress,
        delivery_date: baseDelivery.toISOString().split('T')[0],
        status: 'processing'
      }]);

      if (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
          { error: "Failed to save order" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}