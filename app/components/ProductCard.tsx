// components/ProductCard.tsx
import Link from 'next/link';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <img src={product.image} alt={product.name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p>{product.description}</p>
        <div className="card-actions justify-between items-center">
          <span className="font-bold">${product.price}</span>
          <button 
            className="btn btn-primary"
            onClick={() =>
              addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 })
            }
          >
            Add to Cart
          </button>
        </div>
        <Link href={`/products/${product.id}`}>
          <span className="link link-primary mt-2 block">View Details</span>
        </Link>
      </div>
    </div>
  );
}
