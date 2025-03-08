import { NextRequest, NextResponse } from "next/server";
import {stripe} from "../../lib/stripe";
import {supabase} from "../../lib/supabase";

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Function to calculate the base delivery date (2 weeks from today)
const getDefaultDeliveryDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 14); // Adds 14 days
  return today;
};

// Function to calculate delay based on daily order volume
const calculateDelayByOrdersPerDay = (ordersToday: number) => {
  return Math.floor(ordersToday / 3) * 7; // Adds 1 extra week for every 3 orders
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer", "shipping"],
    });

    // Step 1: Get today's orders count from Supabase
    const todayDate = getTodayDate();
    const { data: orders, error } = await supabase
      .from("orders") // Replace with your actual table name
      .select("id")
      .eq("created_at", todayDate); // Assuming "order_date" is a column storing order timestamps

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to retrieve order data.");
    }

    const ordersToday = orders?.length || 0; // Count the number of orders placed today

    // Step 2: Calculate additional delay based on daily orders
    const delayAdded = calculateDelayByOrdersPerDay(ordersToday);

    // Step 3: Calculate final delivery date
    const deliveryDate = getDefaultDeliveryDate();
    deliveryDate.setDate(deliveryDate.getDate() + delayAdded);

    return NextResponse.json({
      shipping_details: session.shipping_details?.address || null,
      delivery_date: deliveryDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      orders_today: ordersToday, // Today's order count from Supabase
      delay_added: delayAdded, // Extra delay in days
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
