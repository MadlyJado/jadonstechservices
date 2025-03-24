import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { stripe } from "../../lib/stripe";

// Utility to get YYYY-MM-DD string
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// Example logic to determine default delivery date
function getDefaultDeliveryDate(): Date {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 3); // 3-day lead time
  return baseDate;
}

// Simulate delay based on orders count (customize as needed)
function calculateDelayByOrdersPerDay(ordersToday: number): number {
  if (ordersToday > 50) return 2;
  if (ordersToday > 20) return 1;
  return 0;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer", "shipping"],
    });

    // Get today's orders from Supabase
    const todayDate = getTodayDateString(); // "YYYY-MM-DD"
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id")
      .eq("order_date", todayDate);

    if (error) {
      console.error("Supabase Error:", JSON.stringify(error, null, 2));
      throw new Error("Failed to retrieve order data.");
    }

    const ordersToday = orders?.length || 0;
    const delayAdded = calculateDelayByOrdersPerDay(ordersToday);

    // Compute delivery date
    const deliveryDate = getDefaultDeliveryDate();
    deliveryDate.setDate(deliveryDate.getDate() + delayAdded);

    return NextResponse.json({
      shipping_details: session.shipping_details?.address || null,
      delivery_date: deliveryDate.toISOString().split("T")[0],
      orders_today: ordersToday,
      delay_added: delayAdded,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
