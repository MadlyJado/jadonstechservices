'use client';

// context/CartContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  components: {
    "CPU": {
      "name": "",
      "model": "",
      "price": 0,
      "vendor": "",
      "Generation": ""
    },
    "RAM": {
      "Size": "8GB",
      "name": "",
      "price": 0,
      "vendor": "",
      "DDR version": "DDR4"
    },
    "Case": {
      "Size": "Mid Tower",
      "name": "",
      "price": 0,
      "vendor": ""
    },
    "Mouse": {
      "name": "",
      "price": 0,
      "vendor": ""
    },
    "Monitor": {
      "Size": "",
      "name": "",
      "price": 0,
      "vendor": "",
      "Resolution": "",
      "Refresh Rate": ""
    },
    "Keyboard": {
      "name": "",
      "price": 0,
      "vendor": ""
    },
    "Motherboard": {
      "name": "",
      "price": 0,
      "vendor": "",
      "Socket Type": "",
      "Socket Model": ""
    },
    "PowerSupply": {
      "name": "",
      "price": 0,
      "vendor": "",
      "Wattage": "",
      "80 plus rating": ""
    },
    "Graphics Card": {
      "name": "",
      "price": 0,
      "vendor": "",
      "VRAM Size": "8GB"
    }
  }
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
