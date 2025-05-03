"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import CustomPCBuilder from "../components/CustomPCBuilder";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
const categories = ["cpu", "motherboard", "memory", "storage", "graphics", "power", "case"];
const usecases = ["Office", "Productivity", "Gaming"];
const priceranges = ["Budget", "Mid-Range", "High-End"];
const cpuTypes = ["Intel", "AMD"];

export default function CustompcBuilderandPrebuilts() {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: any }>({});
  const [wantsPrebuilt, setWantsPrebuilt] = useState(true);
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedCpuType, setSelectedCpuType] = useState<string>("");
  const [prebuiltConfig, setPrebuiltConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceFee = 150;

  const componentCount = Object.keys(selectedComponents).length;

  const setComponent = (category: string, component: any) => {
    setSelectedComponents((prev) => ({ ...prev, [category]: component }));
  };

  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUseCase(e.target.value);
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPriceRange(e.target.value);
  };

  const handleCpuTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCpuType(e.target.value);
  };

  const fetchPrebuiltComponents = async () => {
    if (!selectedUseCase || !selectedPriceRange || !selectedCpuType) {
      setError("Please select both a use case and a price range.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("pre-builts")
        .select("*")
        .eq("use_case", selectedUseCase)
        .eq("price_range", selectedPriceRange)
        .eq("cpu_type", selectedCpuType)
        .order("created_at", { ascending: false })
        .single();

      if (error) throw error;

      if (data) {
        setPrebuiltConfig(data);
      } else {
        setError("No prebuilt configuration found for the selected criteria.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUseCase && selectedPriceRange) {
      fetchPrebuiltComponents();
    }
  }, [selectedUseCase, selectedPriceRange]);

  const handleCheckout = async (items: any[], serviceFee: number) => {
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
          items: items,
          serviceFee: serviceFee,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Server response:", data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
  
      if (!data.sessionId) {
        throw new Error("No session ID returned from the server");
      }
  
      const result = await stripe?.redirectToCheckout({ 
        sessionId: data.sessionId 
      });
  
      if (result?.error) {
        alert(result.error.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(`An error occurred during checkout: ${err.message}`);
    }
  };

  const handleCustomCheckout = () => {
    const items = Object.values(selectedComponents);
    handleCheckout(items, serviceFee);
  };

  const handlePrebuiltCheckout = () => {
    if (prebuiltConfig) {
      const items = Object.values(prebuiltConfig.components);
      handleCheckout(items, serviceFee);
    }
  };

  return (
    <>
      <NavBar />
      <div className="bg-gradient-to-tl from-emerald-700 to-indigo-700 flex items-center justify-center min-h-screen">
        {!wantsPrebuilt ? (
          <div>
            <CustomPCBuilder
              categories={categories}
              setComponent={setComponent}
              selectedComponents={selectedComponents}
              handleCheckout={handleCustomCheckout}
              serviceFee={serviceFee}
              totalPrice={Object.values(selectedComponents).reduce((sum, item) => sum + item.price, 0) + serviceFee}
              componentCount={componentCount}
            />
            <button
              className="btn-primary btn-wide bg-amber-600 rounded-lg object-center"
              onClick={() => setWantsPrebuilt(true)}
            >
              Don't want to make your own computer? Go back to prebuilts
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
              onChange={handleUseCaseChange}
              value={selectedUseCase}
            >
              <option value="">Pick a use-case for your computer</option>
              {usecases.map((usecase) => (
                <option key={usecase} value={usecase}>
                  {usecase}
                </option>
              ))}
            </select>

            <select
              className="w-full mt-4 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
              onChange={handlePriceRangeChange}
              value={selectedPriceRange}
            >
              <option value="">Pick a price range for your computer</option>
              {priceranges.map((pricerange) => (
                <option key={pricerange} value={pricerange}>
                  {pricerange}
                </option>
              ))}
            </select>
            <select
              className="w-full mt-4 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
              onChange={handleCpuTypeChange}
              value={selectedCpuType}
            >
              <option value="">Pick a CPU type for your computer</option>
              {cpuTypes.map((cpuType) => (
                <option key={cpuType} value={cpuType}>
                  {cpuType}
                </option>
              ))}
            </select>

            <button
              className="mt-4 w-full bg-amber-600 text-black py-2 rounded-lg hover:bg-amber-400"
              onClick={() => setWantsPrebuilt(false)}
            >
              Want to make the computer yourself? Click here! (For advanced users)
            </button>

            {isLoading && <p className="mt-4 text-center">Loading...</p>}
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}

            {!isLoading && !error && prebuiltConfig && (
              <div className="mt-4">
                <h1 className="text-center text-secondary">Prebuilt Configuration for {selectedUseCase} - {selectedPriceRange}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(prebuiltConfig.components).map(([type, component]: [string, any]) => (
                    <div key={type} className="p-4 bg-white rounded-lg shadow-md">
                      <h2 className="font-bold text-lg">{type}</h2>
                      <div className="mt-2">
                        <h3 className="font-semibold">{component.name}</h3>
                        <p>Price: ${component.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                  <h2 className="font-bold text-xl text-center">Total Price: ${prebuiltConfig.price.toFixed(2)}</h2>
                </div>
                <button
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
                  onClick={handlePrebuiltCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}