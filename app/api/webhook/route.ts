import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { stripe } from "../../lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("⚠️ Webhook verification failed:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.id || !session.customer_details) {
      console.error("Missing required session details");
      return new NextResponse("Missing session data", { status: 400 });
    }

    const { id: session_id, customer_details } = session;
    const { address } = customer_details!;

    const shippingDetails = {
      line1: address?.line1 ?? "Unknown",
      city: address?.city ?? "Unknown",
      state: address?.state ?? "Unknown",
      postal_code: address?.postal_code ?? "Unknown",
      country: address?.country ?? "Unknown",
    };

    // Store order in Supabase
    const { error } = await supabase.from("orders").insert([
      {
        session_id,
        created_at: new Date(),
        shipping_details: shippingDetails,
      },
    ]);

    if (error) {
      console.error("Error storing order:", error);
      return new NextResponse("Failed to store order", { status: 500 });
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
