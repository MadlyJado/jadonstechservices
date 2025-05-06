'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import logo from "../lib/logo.png";

export default function NavBar() {
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const uid = process.env.NEXT_PUBLIC_ADMIN_UID!;
  
  useEffect(() => {
    setMounted(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = mounted && session?.user?.id === uid;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('https://web.jadonstechservices.com');
  }

  return (
    <nav className="bg-primary shadow-lg" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0" aria-label="Home">
              <Image 
                src={logo} 
                alt="Jadon's Tech Services Logo - Professional IT Solutions" 
                width={64} 
                height={64} 
                className="rounded-full bg-base-100" 
                priority
              />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link 
                  href="/" 
                  className="text-primary-content hover:bg-secondary-content hover:text-secondary px-3 py-2 rounded-md text-sm font-medium"
                  aria-label="Home page"
                >
                  Home
                </Link>
                <Link 
                  href="/services" 
                  className="text-primary-content hover:bg-secondary-content hover:text-secondary px-3 py-2 rounded-md text-sm font-medium"
                  aria-label="Request services"
                  aria-current="page"
                >
                  Request Services
                </Link>
                <Link 
                  href="/custom-pc" 
                  className="text-primary-content hover:bg-secondary-content hover:text-secondary px-3 py-2 rounded-md text-sm font-medium"
                  aria-label="Custom computer builder"
                >
                  Buy a customized computer
                </Link>
                {mounted && session && (
                  <Link 
                    href="/orders" 
                    className="text-primary-content hover:bg-secondary-content hover:text-secondary px-3 py-2 rounded-md text-sm font-medium"
                    aria-label="My orders"
                  >
                    My Orders
                  </Link>
                )}
                {mounted && isAdmin && (
                  <Link 
                    href="/admin"
                    className="text-primary-content hover:bg-secondary-content hover:text-secondary px-3 py-2 rounded-md text-sm font-medium"
                    aria-label="Admin portal"
                  >
                    Admin Portal
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {mounted && session ? (
              <div className="flex items-center space-x-4">
                <span className="text-accent text-sm" aria-label="Logged in as">{session.user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : mounted ? (
              <>
                <Link 
                  href="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  aria-label="Login"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-2"
                  aria-label="Sign up"
                >
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