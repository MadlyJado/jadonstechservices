// app/products/page.tsx
'use client';

import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  return (
    <div className="bg-gradient-to-tr from-emerald-300 border-t-indigo-400 text-center">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-zinc-300">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
