'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, toZonedTime } from 'date-fns-tz';

interface ShippingInfo {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Order {
  id: number;
  session_id: string;
  user_id: string;
  shipping_address: ShippingInfo | null;
  delivery_date: string;
  status: string;
  order_date: string;
  delay_added: boolean;
}

export default function OrderGrid() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>('');

  useEffect(() => {
    // Set timezone on client side
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('order_date', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatOrderDate = (utcDateString: string) => {
    if (!timezone) return 'Loading timezone...';
    
    try {
      const zonedDate = toZonedTime(utcDateString, timezone);
      return format(zonedDate, 'MMMM d, yyyy', { timeZone: timezone });
    } catch (e) {
      console.error('Invalid date:', utcDateString, e);
      return 'Date not available';
    }
  };

  const formatShippingAddress = (address: ShippingInfo | null) => {
    if (!address) return 'No shipping address provided';
    
    return [
      address.line1,
      address.line2,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country
    ].filter(Boolean).join('\n');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error loading orders: {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          You haven't placed any orders yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-lg">Order #{order.id}</h2>
                <p className="text-sm text-gray-500">
                  {formatOrderDate(order.order_date)} {/* Fixed missing parenthesis */}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Shipping Address</h3>
                {order.shipping_address ? (
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {formatShippingAddress(order.shipping_address)}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No shipping address provided</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Delivery Information</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    {order.delivery_date ? 
                      formatOrderDate(order.delivery_date) : 
                      'Calculating...'}
                  </p>
                  {order.delay_added ? (
                    <p className="flex items-center text-yellow-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delivery may be delayed
                    </p>
                  ) : (
                    <p className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      On track for standard delivery
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}