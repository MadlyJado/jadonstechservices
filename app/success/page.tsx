"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const [ordersToday, setOrdersToday] = useState<number | null>(null);
  const [delayAdded, setDelayAdded] = useState<number | null>(null);
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

        setShippingInfo(data.shipping_details);
        setDeliveryDate(data.delivery_date);
        setOrdersToday(data.orders_today);
        setDelayAdded(data.delay_added);
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
          
          {ordersToday !== null && delayAdded !== null && (
            <div className="mt-2 text-sm text-gray-500">
              <p>📦 Orders placed today: <span className="font-semibold">{ordersToday}</span></p>
              {ordersToday >= 3 ? (
                <p>🚨 Due to high demand, your delivery has been delayed by <span className="font-semibold">{delayAdded}</span> days.</p>
              ) : (
                <p>✅ No delays added—your order will be delivered on time.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
