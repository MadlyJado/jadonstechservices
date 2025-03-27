// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['shipping_details'],
    });

    // Calculate base delivery date (e.g., 5 days out)
    const baseDelivery = new Date();
    baseDelivery.setDate(baseDelivery.getDate() + 14);

    let additionalDelay = 0;

    try {
      const supabaseServClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const orders = await supabaseServClient.from('orders').select('*').eq('order_date', baseDelivery.toISOString().split('T')[0]);
      if (orders.count != null && orders.count > 3 && orders.count < 10) {
        additionalDelay = baseDelivery.getDate() + 14;
      }
      else if (orders.count!= null && orders.count > 10) {
          additionalDelay = baseDelivery.getDate() + 30;
      }
    } catch (delayErr) {
      console.warn("Unable to fetch shipping delay:", delayErr);
    }

    const finalDelivery = new Date(baseDelivery);
    finalDelivery.setDate(baseDelivery.getDate() + additionalDelay);

    return NextResponse.json({
      session_id: session.id,
      shipping_details: session.shipping_details?.address, 
      delivery_date: finalDelivery.toISOString().split('T')[0],
      delay_added: additionalDelay,
    });
  } catch (error) {
    console.error('Stripe session fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
