// app/products/page.tsx
'use client';

import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  return (
      <div className="justify-center items-center bg-gradient-to-r from-lime-700 to-emerald-900">
        <h1>Products</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {/* Fetch and render product cards here */}
        </div>
      </div>
  );
}
