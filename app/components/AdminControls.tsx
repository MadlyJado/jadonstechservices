'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import ComponentCard from './ComponentCard';

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

interface ShippingInfo {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Order {
  id: string;
  session_id: string;
  delay_added: boolean;
  status: string;
  delivery_date: string;
  shipping_address: ShippingInfo;
  components?: Components;
}

export default function AdminControls() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID!;
  const [user, setUser] = useState<any>(null);

  const deselectOrder = () => {
    setSelectedOrder(null);
    router.push("/admin");
  };

  const changeStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", selectedOrder.id)
        .select()
        .single();
      
      if (error) throw error;
      setSelectedOrder(data);
      setStatus("");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const selectOrder = async (e: ChangeEvent<HTMLSelectElement>) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", e.target.value)
        .single();
      
      if (error) throw error;
      setSelectedOrder(data);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user || user.id !== adminUid) {
        router.push('/');
        return;
      }
      
      setUser(user);
    };

    checkAdmin();
  }, [router, adminUid]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase.from("orders").select("*");
        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        console.error(error.message);
      }
    };
    fetchOrders();
  }, []);

  const calculateTotal = (components: Components) => {
    return Object.values(components).reduce(
      (total, component) => total + (component?.price || 0),
      0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-800 to-violet-700 p-6">
      {selectedOrder ? (
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.id}</h2>
            <button
              onClick={deselectOrder}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              Back to Orders
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-white">
                <div>
                  <p className="text-sm text-white/70">Status</p>
                  <p className="font-medium">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Delivery Date</p>
                  <p className="font-medium">{selectedOrder.delivery_date}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-white/80">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                >
                  <option className="text-black" value="">Select new status</option>
                  <option className="text-black" value="processing">Processing</option>
                  <option className="text-black" value="shipped">Shipped</option>
                  <option className="text-black" value="on delivery route">On Delivery Route</option>
                  <option className="text-black" value="delivered">Delivered</option>
                </select>
                
                <button
                  onClick={changeStatus}
                  disabled={!status}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    status 
                      ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                      : 'bg-gray-400 cursor-not-allowed text-gray-700'
                  }`}
                >
                  Update Status
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Shipping Address</h3>
              {selectedOrder.shipping_address ? (
                <div className="space-y-3 text-white">
                  <div>
                    <p className="text-sm text-white/70">Street</p>
                    <p className="font-medium">
                      {selectedOrder.shipping_address.line1}
                      {selectedOrder.shipping_address.line2 && `, ${selectedOrder.shipping_address.line2}`}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70">City</p>
                      <p className="font-medium">{selectedOrder.shipping_address.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">State</p>
                      <p className="font-medium">{selectedOrder.shipping_address.state}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70">Postal Code</p>
                      <p className="font-medium">{selectedOrder.shipping_address.postal_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Country</p>
                      <p className="font-medium">{selectedOrder.shipping_address.country}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/70">No shipping address provided</p>
              )}
            </div>
          </div>

          {selectedOrder.components && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">PC Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedOrder.components).map(([type, component]) => (
                  component && (
                    <ComponentCard
                      key={type}
                      type={type}
                      component={component}
                      variant="admin"
                    />
                  )
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Order Total:</span>
                  <span>${(calculateTotal(selectedOrder.components) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="order-select" className="block text-white/80 mb-2">
                Select an Order
              </label>
              <select
                id="order-select"
                onChange={selectOrder}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
              >
                <option value="">Choose an order...</option>
                {orders.map((order) => (
                  <option className="text-black" key={order.id} value={order.id}>
                    Order #{order.id} - {order.status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white">#{order.id}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">Delivery: {order.delivery_date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">No orders found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}