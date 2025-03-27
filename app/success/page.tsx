"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

interface ShippingInfo {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [delayAdded, setDelayAdded] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage("Missing session ID. Unable to retrieve order details.");
      return;
    }

    async function fetchSessionDetails() {
      try {
        const response = await fetch(`/api/checkout-session?session_id=${sessionId}`);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.error) {
          throw new Error(data.error || "Invalid response from server.");
        }

        const {
          shipping_details,
          delivery_date,
          delay_added,
          session_id: stripeSessionId
        } = data;

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!user) {
          console.warn("User not logged in — skipping Supabase insert.");
          return;
        }

        const formattedAddress = `${shipping_details.line1}, ${shipping_details.city}, ${shipping_details.state} ${shipping_details.postal_code}, ${shipping_details.country}`;
        const todayDate = new Date().toISOString().split("T")[0];

        const sessionData = await supabase.auth.getSession();
        const accessToken = sessionData.data.session?.access_token;

        if (!accessToken) {
          console.warn("No access token found — cannot insert order.");
          return;
        }

        const serviceClient = createClient(
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

        const { error: insertError } = await serviceClient.from("orders").insert([
          {
            user_id: user.id,
            home_addr: formattedAddress,
            shipping_time: delivery_date,
            session_id: stripeSessionId || sessionId,
            order_date: todayDate,
          },
        ]);

        if (insertError) {
          console.error("Failed to insert order into Supabase:", insertError);
        } else {
          console.log("Order inserted successfully!");
        }

        setShippingInfo(shipping_details);
        setDeliveryDate(delivery_date);
        setDelayAdded(delay_added || 0);
      } catch (error) {
        console.error("Error fetching session details:", error);
        setErrorMessage("Failed to load order details. Please try again.");
      }
    }

    fetchSessionDetails();
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-4">
      <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
      <p className="mt-2 text-gray-700">Thank you for your purchase.</p>

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      {shippingInfo && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Shipping Address:</h2>
          <p>{shippingInfo.line1}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postal_code}</p>
          <p>{shippingInfo.country}</p>
        </div>
      )}

      {deliveryDate && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Estimated Delivery Date:</h2>
          <p className="text-gray-700">{deliveryDate}</p>
          <div className="mt-2 text-sm text-gray-500">
            {delayAdded > 0 ? (
              <p>🚨 Due to high demand, your delivery has been delayed by <span className="font-semibold">{delayAdded}</span> days.</p>
            ) : (
              <p>✅ No delays added—your order will be delivered on time.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
