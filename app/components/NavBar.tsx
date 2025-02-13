'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import logo from "../lib/logo.png";
import { useCart } from '../context/CartContext';

export default function NavBar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div className="navbar flex-col bg-transparent">
        <div className="flex-1">
          <Link href="/">
            <Image src={logo} alt="Jadon's Tech Services" width={128} height={128} />
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li className="menu-item text-lg">
              <Link className="menu-link" href="/">Home</Link>
            </li>
            <li className="menu-item text-lg">
              <Link className="menu-link" href="/services">Services</Link>
            </li>
            <li className="menu-item text-lg">
              <Link className="menu-link" href="/">Contact Me</Link>
            </li>
            <li className="menu-item text-lg">
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/cart">
                Cart
                {cartCount > 0 && <span className="badge badge-secondary ml-1">{cartCount}</span>}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <h1 className="text-center text-2xl animate-slide-left-to-right bg-transparent">
        I will NEVER overcharge you!!
      </h1>
    </>
  );
}
