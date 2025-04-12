// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Structure for the component data stored in the 'orders' table's JSONB
interface StoredComponent {
  name: string;  // Name from Stripe Product (used as lookup key)
  price: number; // Price in cents from Stripe Line Item
  id: string;    // Stripe Product ID (still useful to store)
}

// Structure of the JSONB column in the 'orders' table
interface OrderComponents {
  cpu?: StoredComponent;
  motherboard?: StoredComponent;
  memory?: StoredComponent;
  storage?: StoredComponent;
  graphics?: StoredComponent;
  power?: StoredComponent;
  case?: StoredComponent;
  // Add other component types if applicable
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Type guard to validate component CATEGORIES fetched from DB
const isValidComponentCategory = (category: string): category is keyof OrderComponents => {
  return ['cpu', 'motherboard', 'memory', 'storage', 'graphics', 'power', 'case'].includes(category.toLowerCase());
};

// --- Interface for data fetched from your Supabase 'Components' table ---
interface CatalogComponentInfo {
    // We query by name, so we expect name to be returned along with category
    name: string;     // The canonical name (used for matching)
    category: string; // The type like 'cpu', 'motherboard'
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  // --- Initial checks ---
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // --- Handle checkout.session.completed event ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // --- Basic validation ---
    if (!session.id || !session.metadata?.user_id) {
        console.error('Webhook Error: Missing session ID or user_id in metadata', { session_id: session.id, metadata: session.metadata });
        return NextResponse.json({ error: "Missing required session data" }, { status: 400 });
    }

    console.log(`Processing checkout.session.completed for session: ${session.id}`);

    try {
      // --- Retrieve session & line items ---
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product']
      });

      const lineItems = fullSession.line_items?.data || [];
      if (lineItems.length === 0) {
          console.warn(`No line items found for session ${session.id}.`);
      }

      // --- Step 1: Collect unique Stripe Product NAMES ---
      // Filter out items without a valid product object or name
      const productNames = lineItems
        .map(item => item.price?.product)
        .filter((product): product is Stripe.Product =>
             product !== null && typeof product === 'object' && typeof product.name === 'string' && product.name.trim() !== ''
        )
        .map(product => product.name)
        .filter((name, index, self) => self.indexOf(name) === index); // Get unique names

      // Map: product_name (from Stripe/Supabase) -> category (from Supabase)
      let productCategoryMap = new Map<string, string>();

      // --- Step 2: Batch Fetch Component Info using NAMES from Supabase 'Components' table ---
      if (productNames.length > 0) {
          console.log(`Looking up categories in 'Components' table for names: ${productNames.join(', ')}`);
          const { data: componentInfos, error: dbError } = await supabaseAdmin
              .from('Components') // *** YOUR TABLE NAME HERE ***
              .select('name, category') // Select name and category
              .in('name', productNames); // ** Filter using the 'name' column **

          if (dbError) {
              console.error(`Supabase error fetching from Components table (by name) for session ${session.id}:`, dbError);
              throw new Error(`Database error fetching component info: ${dbError.message}`);
          }

          if (componentInfos && componentInfos.length > 0) {
              // Create map: name -> category
              productCategoryMap = new Map(
                  componentInfos.map(info => [info.name, info.category])
              );
              console.log(`Found categories for ${productCategoryMap.size} names in Components table.`);

              // Optional: Check for names that were queried but not found
              const foundNames = new Set(componentInfos.map(info => info.name));
              const missingNames = productNames.filter(name => !foundNames.has(name));
              if (missingNames.length > 0) {
                  console.warn(`Could not find category info in 'Components' table for the following names: ${missingNames.join(', ')}`);
              }

          } else {
               console.warn(`No component information found in Supabase 'Components' table for any of the product names: ${productNames.join(', ')}`);
          }
      }

      // --- Step 3: Process line items using the fetched info (matching by name) ---
      const components: OrderComponents = {};
      for (const item of lineItems) {
        // Basic checks
        if (!item.price || !item.price.product || typeof item.price.product !== 'object' || !item.price.product.id || typeof item.price.product.name !== 'string' || item.price.product.name.trim() === '') {
            console.warn(`Skipping line item due to missing/invalid product data or name: ${item.id}`);
            continue;
        }

        const product = item.price.product as Stripe.Product;
        const productName = product.name; // Use the name from Stripe product for lookup
        const productId = product.id; // Still store the ID

        // Get component category from our Supabase map using the product name
        const componentCategory = productCategoryMap.get(productName);

        if (!componentCategory) {
            console.warn(`Component category not found in Supabase map for product name: "${productName}" (ID: ${productId}). Skipping component. **CHECK NAME MATCHING IN 'Components' TABLE**`);
            continue; // Skip this item if category is unknown
        }

        // Validate the fetched category is one we expect
        const lowerCaseCategory = componentCategory.toLowerCase();
        if (!isValidComponentCategory(lowerCaseCategory)) {
             console.warn(`Invalid component category "${componentCategory}" (lowercase: "${lowerCaseCategory}") found for product name: "${productName}". Skipping component.`);
             continue;
        }

        // Add to components object
        components[lowerCaseCategory] = {
          name: productName,                // Use the name from Stripe (which matched)
          price: item.amount_total || 0,    // Price from Stripe Line Item
          id: productId                     // Still store the Stripe Product ID
        };
        console.log(`Processed component: ${lowerCaseCategory} - ${productName} (ID: ${productId})`);
      }

      // --- Check if any components were successfully processed ---
       if (Object.keys(components).length === 0 && lineItems.length > 0 && productNames.length > 0) {
         console.error(`Webhook Warning: Could not map any line items to valid components for session ${session.id} using product names. Verify names match exactly (case-sensitive) between Stripe Products and the 'name' column in the 'Components' table.`);
       }


      // --- Format Shipping Address (keep as before) ---
      const shippingDetails = fullSession.shipping_details;
      const formattedShippingAddress = { /* ... same as before ... */
          name: shippingDetails?.name || '',
          line1: shippingDetails?.address?.line1 || '',
          line2: shippingDetails?.address?.line2 || null,
          city: shippingDetails?.address?.city || '',
          state: shippingDetails?.address?.state || '',
          postal_code: shippingDetails?.address?.postal_code || '',
          country: shippingDetails?.address?.country || ''
      };

      // --- Calculate Delivery Date and Check for Delays (keep as before) ---
       const baseDelivery = new Date();
       // ... (rest of delivery date calculation remains the same) ...
        baseDelivery.setDate(baseDelivery.getDate() + 14);
        const deliveryDateString = baseDelivery.toISOString().split('T')[0];
        const { count, error: countError } = await supabaseAdmin
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('delivery_date', deliveryDateString);
        if (countError) console.error(`Supabase count error:`, countError);
        let delayAdded = false;
        if (count !== null && count > 3) {
          baseDelivery.setDate(baseDelivery.getDate() + 7);
          delayAdded = true;
        }
        const finalDeliveryDateString = baseDelivery.toISOString().split('T')[0];

      // --- Prepare data for Supabase 'orders' table upsert ---
      const orderData = {
        session_id: session.id,
        user_id: session.metadata.user_id,
        order_date: new Date().toISOString(),
        shipping_address: formattedShippingAddress,
        delivery_date: finalDeliveryDateString,
        status: 'processing',
        delay_added: delayAdded,
        components: components,
      };

      // --- Upsert order data into 'orders' table ---
      const { error: upsertError } = await supabaseAdmin
        .from("orders")
        .upsert(orderData, { onConflict: 'session_id' });

      if (upsertError) {
        console.error('Supabase Upsert Error (orders table):', { /* details */ });
        throw new Error(`Failed to save order to database: ${upsertError.message}`);
      }

      console.log(`Successfully processed and saved order for session ${session.id}`);
      return NextResponse.json({ received: true, processed: true });

    } catch (error: any) {
      console.error(`Error processing session ${session.id}:`, error);
      return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
    }
  } else {
    console.log(`Received unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true, processed: false });
  }
}