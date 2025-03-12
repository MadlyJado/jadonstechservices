import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";
<<<<<<< HEAD
import Stripe from 'stripe';
=======
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
>>>>>>> a7d1892 (Added some new stuffs to checkout-session and webhook api routes)

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const todayDate = new Date().toISOString().split("T")[0];

      // Insert order into Supabase
      const { error } = await supabase.from("orders").insert([
        {
          session_id: session.id,
          order_date: todayDate,
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
