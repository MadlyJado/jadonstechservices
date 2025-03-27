'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Order {
  id: number;
  home_addr: string;
  order_date: string;
}

export default function OrderGrid() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <h2 className="font-semibold text-lg">Order #{order.id}</h2>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Address:</strong> {order.home_addr}
            </p>
            <p className="text-xs text-gray-400 mt-2">Placed: {new Date(order.order_date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
