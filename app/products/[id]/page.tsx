// app/products/[id]/page.tsx
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl">
        <figure>
          <img src={product.image} alt={product.name} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{product.name}</h2>
          <p>{product.description}</p>
          <span className="font-bold text-xl">${product.price}</span>
          <div className="card-actions mt-4">
            <button
              className="btn btn-primary"
              onClick={() =>
                addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 })
              }
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
