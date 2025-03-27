import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../lib/stripe'
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 🔹 Parse items from body
    const { items }: { items: { name: string; price: number }[] } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 })
    }

    const accessToken = (await supabase.auth.getSession()).data.session?.access_token;

    const supabaseClient = createClient(process.env.SUPABASE_URL, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    if (!accessToken) {
      console.log("No access token found. Unable to create checkout session.")
      return NextResponse.json({ error: 'Unauthorized: No access token' }, { status: 401 })
    }

   


    if (userError || !user) {
      console.log('Error fetching user:', userError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // 🔹 Build Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }))

    // 🔹 Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
