"use client";

import { useState, useMemo, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import CustomPCBuilder from "../components/CustomPCBuilder";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
const categories = ["cpu", "motherboard", "memory", "storage", "graphics", "power", "case"];
const usecases = ["Office", "Productivity", "Gaming"];
const priceranges = ["Budget", "Mid-Range", "High-End"];

const CustompcBuilderandPrebuilts = () => {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: any }>({});
  const [wantsPrebuilt, setWantsPrebuilt] = useState(true);
  const serviceFee = 150;
  
  // Track number of selected components to calculate service fees
  const componentCount = Object.keys(selectedComponents).length;

  const setComponent = (category: string, component: any) => {
    setSelectedComponents((prev) => ({ ...prev, [category]: component }));
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedComponents).reduce(
      (sum, component) => sum + (component?.price || 0),
      0
    ) + serviceFee;
  }, [selectedComponents, serviceFee]);

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
          serviceFee: serviceFee // Include service fee in checkout
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
      {!wantsPrebuilt && (
         <div>
            <CustomPCBuilder categories={categories} setComponent={setComponent} selectedComponents={selectedComponents} handleCheckout={handleCheckout} serviceFee={serviceFee} totalPrice={totalPrice} componentCount={componentCount}/>
            <button className="btn-primary btn-wide bg-amber-600 rounded-lg object-center" onClick={(e) => {
              switch(wantsPrebuilt.valueOf()){
                case true:
                  setWantsPrebuilt(false);
                  break;
                case false:
                  setWantsPrebuilt(true);
                  break;
              }

            }}>Don't want to make your own computer from these lists after all? Press this button to go back to the prebuilts</button>
         </div>
      )}
      {wantsPrebuilt && (
        <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
            <select className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center">
              <option>Pick a use-case for your computer</option>
              {usecases.map((usecase) => (
                <option key={usecase}>{usecase}</option>
              ))}
            </select>
            <button className="mt-4 w-full bg-amber-600 text-black py-2 rounded-lg hover:bg-amber-400" onClick={(e) => {
              switch(wantsPrebuilt.valueOf()){
                case true:
                  setWantsPrebuilt(false);
                  break;
                case false:
                  setWantsPrebuilt(true);
                  break;
              }
            }}>Want to make the computer yourself?? Click here! (Warning: For people advanced in pc building!)</button>
            {}
        </div>
      )}
      </div>
    </>
  );
};

export default CustompcBuilderandPrebuilts;