// pages/api/shippingDelay.ts
// Next.js API route to calculate shipping delay based on daily orders.
// Applies an exponential delay formula for orders beyond a threshold per day.

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

// Threshold for daily orders (e.g., first 3 orders have no delay).
const DAILY_ORDER_THRESHOLD = 3;

/**
 * Calculate additional shipping delay (in days) based on the number of orders for the day.
 * - If there are DAILY_ORDER_THRESHOLD or fewer orders, no additional delay.
 * - For each order beyond the threshold, add exponentially increasing delay.
 *   Formula: delayDays = 2^(ordersBeyondThreshold) - 1.
 * 
 * Examples:
 * - 4 orders (1 beyond threshold)  -> 2^1 - 1 = 1 day delay
 * - 5 orders (2 beyond threshold)  -> 2^2 - 1 = 3 days delay
 * - 6 orders (3 beyond threshold)  -> 2^3 - 1 = 7 days delay
 */
function calculateDelayByOrdersPerDay(orderCount: number): number {
  // If orders are within the threshold, no extra delay.
  if (orderCount <= DAILY_ORDER_THRESHOLD) {
    return 0;
  }
  // Calculate how many orders are beyond the threshold.
  const ordersBeyondThreshold = orderCount - DAILY_ORDER_THRESHOLD;
  // Compute exponential delay: 2^(ordersBeyondThreshold) - 1.
  const delayDays = Math.pow(2, ordersBeyondThreshold) - 1;
  return delayDays;
}

// API Route Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only GET requests for this endpoint.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get current date in YYYY-MM-DD format (to match the date stored in Supabase).
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0]; // e.g., "2025-03-24"

    // Query Supabase for the number of orders placed today.
    const { data, count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }) // count exact matches without retrieving full data
      .eq('order_date', todayDateStr);

    // If there's an error with the query, throw it to be caught below.
    if (error) {
      throw error;
    }

    // Determine today's order count from the query result.
    // Using the count if available, otherwise fall back to data length (if data was fetched).
    const ordersCount: number = (typeof count === 'number')
      ? count 
      : Array.isArray(data) 
        ? data.length 
        : 0;

    // Calculate the additional shipping delay based on today's orders.
    const additionalDelayDays = calculateDelayByOrdersPerDay(ordersCount);

    // (Optional) Calculate the expected shipping date by adding the delay to current date.
    // For example:
    // const estimatedShippingDate = new Date();
    // estimatedShippingDate.setDate(estimatedShippingDate.getDate() + additionalDelayDays);
    // const shippingDateStr = estimatedShippingDate.toISOString().split('T')[0];
    // In this example, we'll return just the delay days.

    // Return the calculated delay (and optionally the shipping date if needed).
    return res.status(200).json({ shippingDelayDays: additionalDelayDays /*, estimatedShippingDate: shippingDateStr */ });
  } catch (err) {
    console.error('Error calculating shipping delay:', err);
    // Return a generic 500 error with details for debugging.
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to calculate shipping delay', details: errorMessage });
  }
}
