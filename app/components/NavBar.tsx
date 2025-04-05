'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import logo from "../lib/logo.png";

export default function NavBar() {
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false); // Track if component is mounted
  const router = useRouter();
  const uid = process.env.NEXT_PUBLIC_ADMIN_UID;
  
  useEffect(() => {
    setMounted(true); // Set mounted to true when component mounts
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = mounted && session?.user?.id === uid; // Only check admin status when mounted

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <nav className="bg-gradient-to-r from-stone-700 to-slate-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image 
                src={logo} 
                alt="Jadon's Tech Services" 
                width={64} 
                height={64} 
                className="rounded-full" 
                priority // Add priority for above-the-fold images
              />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/" className="text-violet-300 hover:bg-stone-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/services" className="text-violet-300 hover:bg-stone-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Request Services</Link>
                <Link href="/custom-pc" className="text-violet-300 hover:bg-stone-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Buy a customized computer</Link>
                {mounted && session && (
                  <Link href="/orders" className="text-violet-300 hover:bg-stone-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Orders</Link>
                )}
                {mounted && isAdmin && (
                  <Link href="/admin" className="text-violet-300 hover:bg-stone-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Admin Portal</Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {mounted && session ? (
              <div className="flex items-center space-x-4">
                <span className="text-violet-300 text-sm">{session.user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : mounted ? (
              <>
                <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  Login
                </Link>
                <Link href="/signup" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="bg-emerald-900 py-2">
        <h1 className="text-center text-xl text-white font-semibold animate-pulse">
          I will NEVER overcharge you!!
        </h1>
      </div>
    </nav>
  );
}