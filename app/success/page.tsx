"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import ComponentCard from "../components/ComponentCard";
import Link from "next/link";

interface ShippingInfo {
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Component {
  name: string;
  price: number;
  id: string;
}

interface Components {
  cpu?: Component;
  motherboard?: Component;
  memory?: Component;
  storage?: Component;
  graphics?: Component;
  power?: Component;
  case?: Component;
}

interface OrderDetails {
  shipping_address: ShippingInfo | null;
  delivery_date: string;
  status: string;
  order_date: string;
  delay_added: boolean;
  components?: Components | null;
  amount_total?: number | null;
}

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

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
        
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!order) {
          if (retryCount < MAX_RETRIES) {
            const retryDelay = 2000 * (retryCount + 1);
            console.log(`Order not found, retrying in ${retryDelay}ms...`);
            setTimeout(() => setRetryCount(prev => prev + 1), retryDelay);
            return;
          }
          throw new Error('Order not found after multiple attempts');
        }

        setOrderDetails({
          shipping_address: order.shipping_address,
          delivery_date: order.delivery_date,
          status: order.status,
          order_date: order.order_date,
          delay_added: order.delay_added,
          components: order.components,
          amount_total: order.amount_total
        });
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, retryCount]);

  // Helper functions
  const calculateTotal = (components?: Components | null) => {
    if (!components) return 0;
    return Object.values(components).reduce(
      (total, component) => total + (component?.price || 0),
      0
    );
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Invalid Date";
    }
  }

  const formattedTotal = ((orderDetails?.amount_total || calculateTotal(orderDetails?.components)) / 100).toFixed(2);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-700">
          {retryCount > 0 
            ? `Looking for your order... (Attempt ${retryCount + 1} of ${MAX_RETRIES + 1})`
            : "Processing your order..."}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-700 mt-4 mb-2">Order Retrieval Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          {sessionId && <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>}
          <button
            onClick={() => {
              setRetryCount(0);
              setLoading(true);
              setError(null);
            }}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-3xl font-bold text-green-700 mt-4">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order details are below.
          </p>
          <p className="text-xs text-gray-400 mt-1">Order Placed: {formatDate(orderDetails?.order_date)}</p>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Status</h2>
            <p className="font-medium text-blue-600 capitalize bg-blue-50 px-3 py-1 rounded-full inline-block">
              {orderDetails?.status || "Processing"}
            </p>
          </div>

          {/* Shipping Information */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipping To</h2>
            {orderDetails?.shipping_address ? (
              <div className="text-gray-700 leading-relaxed">
                {orderDetails.shipping_address.name && <p className="font-medium">{orderDetails.shipping_address.name}</p>}
                {orderDetails.shipping_address.line1 && <p>{orderDetails.shipping_address.line1}</p>}
                {orderDetails.shipping_address.line2 && <p>{orderDetails.shipping_address.line2}</p>}
                <p>
                  {[
                    orderDetails.shipping_address.city,
                    orderDetails.shipping_address.state,
                    orderDetails.shipping_address.postal_code
                  ].filter(Boolean).join(', ')}
                </p>
                {orderDetails.shipping_address.country && <p>{orderDetails.shipping_address.country}</p>}
              </div>
            ) : (
              <p className="text-gray-500 italic">No shipping address provided or required.</p>
            )}
          </div>

          {/* PC Components & Total */}
          {orderDetails?.components && Object.keys(orderDetails.components).length > 0 ? (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(orderDetails.components)
                  .filter(([_, component]) => component !== null)
                  .map(([type, component]) => (
                    <ComponentCard
                      key={type}
                      type={type.charAt(0).toUpperCase() + type.slice(1)}
                      component={component as Component}
                      variant="user"
                    />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Order Total:</span>
                  <span className="text-gray-900">${formattedTotal}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h2>
              <p className="text-gray-500 italic">Component details not available.</p>
            </div>
          )}

          {/* Delivery Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Delivery Estimate</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Estimated Delivery Date:</span>{" "}
                <span className="font-semibold">
                  {formatDate(orderDetails?.delivery_date)}
                </span>
              </p>
              {orderDetails?.delay_added ? (
                <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                  <svg className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800">
                    Due to high demand, your order delivery has been adjusted. We appreciate your patience.
                  </span>
                </div>
              ) : (
                <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800">
                    Your order is on track for the estimated delivery date.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Links/Reference */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            You can view your order history in your account. Need help?{" "}
            <a href="/contact" className="text-blue-600 hover:underline font-medium">
              Contact Support
            </a>
          </p>
          {sessionId && (
            <p className="text-xs text-gray-400 mt-2">
              Order Reference: {sessionId}
            </p>
          )}
        </div>
        <div className="btn-primary btn-large">
            <Link href="/">Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}