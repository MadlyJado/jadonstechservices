// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    baseDelivery.setDate(baseDelivery.getDate() + 5);

    let additionalDelay = 0;

    try {
      const delayResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shippingDelay`);
      const delayData = await delayResponse.json();
      additionalDelay = delayData.shippingDelayDays || 0;
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
