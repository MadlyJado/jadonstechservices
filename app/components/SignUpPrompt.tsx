'use client';

import React from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type FormData = {
  email: string;
  password: string;
  confirmpassword: string;
};

export default function SignUpPrompt() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [status, setStatus] = useState<string>('');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const { email, password, confirmpassword } = data;
    setStatus("Signing up...");
    if (password === confirmpassword) {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) {
        setStatus("Signup had an error!: " + error.message);
      } else {
        setStatus("Signup was successful!");
      }
    } else {
      setStatus("Passwords do not match");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="you@example.com"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              {...register("password", { required: "Password is required" })}
              type="password"
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmpassword"
              {...register("confirmpassword", { required: "Confirm password is required" })}
              type="password"
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.confirmpassword && <p className="mt-2 text-sm text-red-600">{errors.confirmpassword.message}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>
        {status && (
          <div className={`mt-4 p-4 rounded-md ${status.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}