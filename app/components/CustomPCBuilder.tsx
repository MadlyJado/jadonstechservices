'use client';
import Dropdown from './Dropdown';
import Head from 'next/head';
import React from 'react'

function CustomPCBuilder({categories, setComponent, selectedComponents, handleCheckout, serviceFee, totalPrice, componentCount}) {
  return (
    <>
      <Head>
        <title>Custom PC Builder | Jadon's Tech Services</title>
        <meta name="description" content="Build your dream custom PC with our easy-to-use configurator. Select components and get expert assembly with a flat service fee." />
        <meta name="keywords" content="custom pc builder, computer assembly, build your own pc, gaming pc, workstation pc" />
      </Head>

      <div className="max-w-3xl mx-auto p-6 mt-10 items-center">
        <h1 className="text-2xl font-bold mb-6 text-amber-700 text-center">Build Your Custom PC</h1>

        {categories.map((category) => (
          <Dropdown
            key={category}
            category={category}
            selectedComponent={selectedComponents[category]}
            setSelectedComponent={(component) => setComponent(category, component)}
            serviceFees={serviceFee}
          />
        ))}

        <div className="mt-6 p-4">
          <h2 className="text-xl font-semibold text-center">
            Total Price: ${totalPrice.toFixed(2)}
          </h2>
          <h2 className="text-xl font-semibold text-center">
            Service Fee: ${serviceFee.toFixed(2)} (Flat rate)
          </h2>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-blue-600 text-black py-2 rounded-lg hover:bg-blue-700"
          disabled={componentCount === 0}
          aria-label="Proceed to checkout with selected components"
        >
          Checkout with Stripe
        </button>
      </div>
    </>
  )
}

export default CustomPCBuilder