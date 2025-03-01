import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("Error: No session_id provided.");
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    console.log("Fetching Stripe session:", sessionId);

    // Retrieve checkout session from Stripe (No need to expand)
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Stripe session retrieved:", session);

    if (!session || !session.shipping_details) {
      console.error("Error: No shipping details found in session.");
      return NextResponse.json({ error: "No shipping details available" }, { status: 500 });
    }

    // Get recent purchase count for delivery logic
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact" })
      .gte("purchase_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    console.log("Purchase count in last 7 days:", count);

    // Calculate estimated delivery date
    let deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 14); // Default 2 weeks

    if (count >= 3) {
      deliveryDate.setDate(deliveryDate.getDate() + 14); // Delay by 2 more weeks
    }

    console.log("Estimated delivery date:", deliveryDate.toISOString().split("T")[0]);

    // Return shipping details and delivery date
    return NextResponse.json({
      shipping_details: session.customer_details?.address || null,
      delivery_date: deliveryDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Stripe API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
