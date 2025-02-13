// app/cart/page.tsx
'use client';

import NavBar from '../components/NavBar';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="input input-bordered w-16"
                  />
                </td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex justify-end">
        <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
      </div>
      <div className="flex justify-end mt-4">
        <a href="/checkout" className="btn btn-primary">
          Checkout
        </a>
      </div>
    </div>
  );
}
