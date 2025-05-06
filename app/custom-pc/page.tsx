"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import CustomPCBuilder from "../components/CustomPCBuilder";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";
import Head from 'next/head';

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
      <Head>
        <title>Custom PC Builder & Prebuilt Configurations | Jadon's Tech Services</title>
        <meta name="description" content="Choose from expertly curated prebuilt PCs or build your own custom computer with our easy-to-use configurator." />
        <meta name="keywords" content="prebuilt computers, custom pc builder, gaming pc, workstation pc, computer configurations" />
        <meta property="og:title" content="Custom PC Builder & Prebuilt Configurations | Jadon's Tech Services" />
        <meta property="og:description" content="Choose from prebuilt PCs or build your own custom computer with our configurator." />
        <link rel="canonical" href="https://web.jadonstechservices.com/custom-pc" />
      </Head>
      
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
              aria-label="Switch to prebuilt computer options"
            >
              Don't want to make your own computer? Go back to prebuilts
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
            <h1 className="text-2xl font-bold text-center text-white mb-6">Find Your Perfect Prebuilt PC</h1>
            
            <div className="space-y-4">
              <label htmlFor="useCase" className="sr-only">Select use case</label>
              <select
                id="useCase"
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
                onChange={handleUseCaseChange}
                value={selectedUseCase}
                aria-required="true"
              >
                <option value="">Pick a use-case for your computer</option>
                {usecases.map((usecase) => (
                  <option key={usecase} value={usecase}>
                    {usecase}
                  </option>
                ))}
              </select>

              <label htmlFor="cpuType" className="sr-only">Select CPU type</label>
              <select
                id="cpuType"
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
                onChange={handleCpuTypeChange}
                value={selectedCpuType}
                aria-required="true"
              >
                <option value="">Pick a CPU type for your computer</option>
                {cpuTypes.map((cpuType) => (
                  <option key={cpuType} value={cpuType}>
                    {cpuType}
                  </option>
                ))}
              </select>

              <label htmlFor="priceRange" className="sr-only">Select price range</label>
              <select
                id="priceRange"
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
                onChange={handlePriceRangeChange}
                value={selectedPriceRange}
                aria-required="true"
              >
                <option value="">Pick a price range for your computer</option>
                {priceranges.map((pricerange) => (
                  <option key={pricerange} value={pricerange}>
                    {pricerange}
                  </option>
                ))}
              </select>

              
            </div>

            <button
              className="mt-4 w-full bg-amber-600 text-black py-2 rounded-lg hover:bg-amber-400"
              onClick={() => setWantsPrebuilt(false)}
              aria-label="Switch to custom computer builder"
            >
              Want to make the computer yourself? Click here! (For advanced users)
            </button>

            {isLoading && <p className="mt-4 text-center text-white">Loading...</p>}
            {error && <p className="mt-4 text-center text-red-300" role="alert">{error}</p>}

            {!isLoading && !error && prebuiltConfig && (
              <div className="mt-4">
                <h2 className="text-center text-white text-xl font-semibold mb-4">
                  {selectedUseCase} {selectedPriceRange} PC Configuration ({selectedCpuType})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(prebuiltConfig.components).map(([type, component]: [string, any]) => (
                    <div key={type} className="p-4 bg-white rounded-lg shadow-md" itemScope itemType="https://schema.org/Product">
                      <h3 className="font-bold text-lg" itemProp="category">{type}</h3>
                      <div className="mt-2">
                        <h4 className="font-semibold" itemProp="name">{component.name}</h4>
                        <p itemProp="price">Price: ${component.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                  <h2 className="font-bold text-xl text-center">
                    Total Price: ${prebuiltConfig.price.toFixed(2)}
                  </h2>
                </div>
                <button
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
                  onClick={handlePrebuiltCheckout}
                  aria-label="Proceed to checkout with selected prebuilt configuration"
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