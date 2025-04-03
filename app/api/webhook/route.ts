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
      
      // Retrieve session without expanding shipping_details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);
      
      // Shipping details are already included in the session object
      const shippingAddress = fullSession.shipping_details?.address;

      const formattedShippingAddress = {
        line1: shippingAddress?.line1 || '',
        line2: shippingAddress?.line2 || null,
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        postal_code: shippingAddress?.postal_code || '',
        country: shippingAddress?.country || ''
      };

      const userId = session.metadata?.user_id;

      // Calculate delivery date (14 days from now)
      const baseDelivery = new Date();
      baseDelivery.setDate(baseDelivery.getDate() + 14);

      // In your webhook handler, add a check for existing orders:
      const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('session_id', session.id)
      .single();

      if (existingOrder) {
      return NextResponse.json({ received: true, message: 'Order already exists' });
      }

      // Check for delivery delays (similar to your GET endpoint)
      let delayAdded = false;
      const { count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_date', baseDelivery.toISOString().split('T')[0]);

      if (count && count > 3) {
        baseDelivery.setDate(baseDelivery.getDate() + 7);
        delayAdded = true;
      }

      // Insert order with shipping address
      const { error } = await supabaseAdmin.from("orders").insert([{
        session_id: session.id,
        user_id: userId,
        order_date: new Date().toISOString(),
        shipping_address: formattedShippingAddress,
        delivery_date: baseDelivery.toISOString().split('T')[0],
        status: 'processing',
        delay_added: delayAdded
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
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook handler failed" },
      { status: 400 }
    );
  }
}