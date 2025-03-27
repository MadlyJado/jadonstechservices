import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    // ✅ Step 1: Read the access token from the cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized: No access token" }, { status: 401 });
    }

    // ✅ Step 2: Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      }
    );

    // ✅ Step 3: Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    // ✅ Step 4: Create Stripe line items
    const lineItems = items.map((item: { name: string; price: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    // ✅ Step 5: Create Stripe session with user_id in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        user_id: user.id, // 🧠 now it's linked to the Supabase user
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
