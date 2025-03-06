"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Dropdown from "../components/Dropdown";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const categories = ["cpu", "motherboard", "memory", "storage", "graphics", "power", "case"];

const CustomPCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: any }>({});

  // Function to update the selected component
  const setComponent = (category: string, component: any) => {
    setSelectedComponents((prev) => ({ ...prev, [category]: component }));
  };

  // Calculate total price of selected components
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + (component?.price+50 || 0),
    0
  );

  // Handle Stripe Checkout
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: Object.values(selectedComponents) }),
    });

    const { sessionId } = await response.json();
    stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div className="bg-gradient-to-tl from-emerald-700 to-indigo-700 flex items-center justify-center min-h-screen">
       <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
        <h1 className="text-2xl font-bold mb-6 text-amber-700 text-center">Build Your Custom PC</h1>

        {categories.map((category) => (
          <Dropdown
            key={category}
            category={category}
            selectedComponent={selectedComponents[category]}
            setSelectedComponent={(component) => setComponent(category, component)}
          />
        ))}

        <div className="mt-6 p-4">
          <h2 className="text-xl font-semibold text-center">Total Price: ${totalPrice.toFixed(2)}</h2>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-blue-600 text-black py-2 rounded-lg hover:bg-blue-700"
          disabled={totalPrice === 0}
        >
          Checkout with Stripe
        </button>
      </div>
    </div>
   
  );
};

export default CustomPCBuilder;
