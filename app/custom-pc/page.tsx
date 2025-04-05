"use client";

import { useState, useMemo, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Dropdown from "../components/Dropdown";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
const categories = ["cpu", "motherboard", "memory", "storage", "graphics", "power", "case"];

const CustomPCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: any }>({});
  const [serviceFees, setServiceFees] = useState(20);
  
  // Track number of selected components to calculate service fees
  const componentCount = Object.keys(selectedComponents).length;

  // Update service fees whenever component count changes
  useEffect(() => {
    setServiceFees(20 + (componentCount * 15));
  }, [componentCount]);

  const setComponent = (category: string, component: any) => {
    setSelectedComponents((prev) => ({ ...prev, [category]: component }));
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedComponents).reduce(
      (sum, component) => sum + (component?.price || 0),
      0
    ) + serviceFees;
  }, [selectedComponents, serviceFees]);

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to continue.");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: Object.values(selectedComponents),
          serviceFee: serviceFees // Include service fee in checkout
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error || "Failed to create Stripe session");
      }

      const result = await stripe?.redirectToCheckout({ 
        sessionId: data.sessionId 
      });

      if (result?.error) {
        alert(result.error.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="bg-gradient-to-tl from-emerald-700 to-indigo-700 flex items-center justify-center min-h-screen">
        <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
          <h1 className="text-2xl font-bold mb-6 text-amber-700 text-center">Build Your Custom PC</h1>

          {categories.map((category) => (
            <Dropdown
              key={category}
              category={category}
              selectedComponent={selectedComponents[category]}
              setSelectedComponent={(component) => setComponent(category, component)}
              serviceFees={serviceFees}
            />
          ))}

          <div className="mt-6 p-4">
            <h2 className="text-xl font-semibold text-center">
              Total Price: ${totalPrice.toFixed(2)}
            </h2>
            <h2 className="text-xl font-semibold text-center">
              Service Fees: ${serviceFees.toFixed(2)} ({componentCount} component{componentCount !== 1 ? 's' : ''})
            </h2>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-4 w-full bg-blue-600 text-black py-2 rounded-lg hover:bg-blue-700"
            disabled={componentCount === 0}
          >
            Checkout with Stripe
          </button>
        </div>
      </div>
    </>
  );
};

export default CustomPCBuilder;