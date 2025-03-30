// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve session with expanded shipping details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['shipping_details.address'],
    });

    // Calculate base delivery date (14 days from now)
    const baseDelivery = new Date();
    baseDelivery.setDate(baseDelivery.getDate() + 14);

    // Check for delivery delays
    let delayAdded = false;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Count orders scheduled for the same delivery date
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_date', baseDelivery.toISOString().split('T')[0]);

    // Apply delay if more than 3 orders exist
    if (count && count > 3) {
      baseDelivery.setDate(baseDelivery.getDate() + 7); // Add 7 day delay
      delayAdded = true;
    }

    return NextResponse.json({
      session_id: session.id,
      shipping_details: session.shipping_details?.address || null,
      delivery_date: baseDelivery.toISOString().split('T')[0],
      delay_added: delayAdded,
      status: 'success',
    });
  } catch (err) {
    console.error('Stripe session retrieval error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve session', details: err.message },
      { status: 500 }
    );
  }
}