'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import logo from "../lib/logo.png";

export default function NavBar() {
  return (
      <div className='bg-gradient-to-r from-stone-700 to-slate-400'>
          <div className="navbar flex-col">
          <div className="flex-1">
            <Link href="/">
              <Image src={logo} alt="Jadon's Tech Services" width={128} height={128} />
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1 text-violet-400">
              <li className="menu-item text-lg">
                <Link className="menu-link" href="/">Home</Link>
              </li>
              <li className="menu-item text-lg">
                <Link className="menu-link" href="/services">Request Services</Link>
              </li>
              <li className="menu-item text-lg">
                <Link href="/custom-pc">Buy a customized computer</Link>
              </li>
            </ul>
          </div>
          <h1 className="text-center text-2xl animate-slide-left-to-right text-emerald-900">
          I will NEVER overcharge you!!
          </h1>
        </div>
      </div>
      
  );
}
