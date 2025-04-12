// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key here as well if you need to bypass RLS for reading any order.
// If you have RLS policies allowing users to read their own orders,
// you might use the anon key or a user-specific client, but service key is simpler for backend routes.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    console.log(`Workspaceing order details for session_id: ${sessionId}`);

    // Query the Supabase 'orders' table for the specific order using the session_id
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .select('*') // Select all columns for the order
      .eq('session_id', sessionId)
      .single(); // Expect only one matching order

    // Handle potential errors during database query
    if (dbError) {
      // If error code 'PGRST116', it means no rows were found
      if (dbError.code === 'PGRST116') {
        console.log(`Order not found in database for session_id: ${sessionId}. Webhook might not have processed yet.`);
        return NextResponse.json(
          { error: 'Order not found or still processing.' },
          { status: 404 } // Use 404 Not Found
        );
      }
      // For other database errors
      console.error(`Supabase query error for session ${sessionId}:`, dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    // If orderData is null/undefined even without an error (shouldn't happen with .single())
     if (!orderData) {
        console.log(`Order data unexpectedly null for session_id: ${sessionId}.`);
        return NextResponse.json(
          { error: 'Order not found.' },
          { status: 404 }
        );
     }


    console.log(`Successfully retrieved order details for session_id: ${sessionId}`);

    // Return the relevant data directly from the Supabase record
    // No need to call Stripe API here unless you need data *not* stored in your DB
    return NextResponse.json({
      session_id: orderData.session_id,
      user_id: orderData.user_id,
      order_date: orderData.order_date,
      shipping_details: orderData.shipping_address, // Directly use the JSONB data
      delivery_date: orderData.delivery_date,     // Use the stored delivery date
      delay_added: orderData.delay_added,         // Use the stored delay flag
      status: orderData.status,                   // Use the stored status
      components: orderData.components,           // *** Include the components JSONB data ***
      amount_total: orderData.amount_total,       // Include total if stored
      customer_email: orderData.customer_email,   // Include email if stored
      // Add any other fields from orderData you want to return
    });

  } catch (err: any) {
    console.error(`Error retrieving checkout session details for ${sessionId}:`, err);
    return NextResponse.json(
      { error: 'Failed to retrieve order details', details: err.message },
      { status: 500 } // Internal Server Error
    );
  }
}