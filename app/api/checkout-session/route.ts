import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../..//lib/supabase";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const session_id = url.searchParams.get("session_id");

  if (!session_id) {
    return new NextResponse(JSON.stringify({ error: "Session ID is required" }), { status: 400 });
  }

  try {
    // Fetch order from Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("session_id", session_id)
      .single();

    if (error || !order) {
      return new NextResponse(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    // Count today's orders
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    if (countError) {
      console.error("Error fetching today's orders:", countError);
      return new NextResponse(JSON.stringify({ error: "Error retrieving today's orders" }), { status: 500 });
    }

    // Base delivery time
    let deliveryDays = 5;

    // Apply exponential delay if more than 3 orders today
    if (count && count > 3) {
      let extraDays = Math.pow(2, count - 3); // Exponential growth
      deliveryDays += extraDays;
    }

    const estimatedDelivery = addDays(new Date(), deliveryDays);

    return new NextResponse(
      JSON.stringify({
        shipping_details: order.shipping_details,
        delivery_date: estimatedDelivery.toISOString().split("T")[0], // Format YYYY-MM-DD
        orders_today: count,
        delay_added: deliveryDays - 5, // Show how much delay was added
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching session details:", err);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
