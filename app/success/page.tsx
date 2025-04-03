"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

interface ShippingInfo {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface OrderDetails {
  shipping_address: ShippingInfo | null; // Make it nullable
  delivery_date: string;
  status: string;
  order_date: Date;
}

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [delayAdded, setDelayAdded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session ID. Unable to retrieve order details.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Just fetch existing order instead of creating
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('session_id', sessionId)
          .single();
    
          console.log('Fetched order:', order);

        if (error) throw error;
        if (!order) throw new Error('Order not found');
    
        setOrderDetails({
          shipping_address: order.shipping_address,
          delivery_date: order.delivery_date,
          status: order.status,
          order_date: order.order_date,
        });
        setDelayAdded(order.delay_added || false);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-green-700">Processing your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Order Processing Error</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Please contact support with your session ID: {sessionId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="text-center mb-8">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h1 className="text-3xl font-bold text-green-700 mt-4">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800">Order Information</h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {new Date(orderDetails?.order_date || '').toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">
                  {orderDetails?.status || "processing"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {orderDetails?.shipping_address ? (
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
            <div className="mt-2 space-y-1">
              {orderDetails.shipping_address.line1 && <p>{orderDetails.shipping_address.line1}</p>}
              {orderDetails.shipping_address.line2 && <p>{orderDetails.shipping_address.line2}</p>}
              <p>
                {[
                  orderDetails.shipping_address.city,
                  orderDetails.shipping_address.state,
                  orderDetails.shipping_address.postal_code
                ]
                .filter(Boolean)
                .join(', ')}
              </p>
              {orderDetails.shipping_address.country && <p>{orderDetails.shipping_address.country}</p>}
            </div>
          </div>
        ) : (
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
            <p className="text-gray-500 mt-2">No shipping address provided</p>
          </div>
        )}

          {/* Delivery Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Delivery Details</h2>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {orderDetails?.delivery_date ? 
                  new Date(orderDetails.delivery_date).toLocaleDateString() : 
                  "Calculating..."}
              </p>
              {delayAdded ? (
                <div className="flex items-start p-3 bg-yellow-50 rounded-md">
                  <svg
                    className="h-5 w-5 text-yellow-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-yellow-700">
                    Due to high demand, your delivery may take longer than usual.
                  </span>
                </div>
              ) : (
                <div className="flex items-start p-3 bg-green-50 rounded-md">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-700">
                    Your order is on track for standard delivery.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="/contact"
              className="text-green-600 hover:underline font-medium"
            >
              Contact our support team
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Order reference: {sessionId}
          </p>
        </div>
      </div>
    </div>
  );
}