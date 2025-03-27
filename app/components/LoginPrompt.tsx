'use client';

import React from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type FormData = {
  email: string;
  password: string;
}

export default function LoginPrompt() {
  const { register: login, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [status, setStatus] = useState<string>('');
  const onSubmit: SubmitHandler<FormData> = async (data) => {
      const { email, password } = data;
      setStatus("Logging in...");
      const signin = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if(signin.error) {
        setStatus(signin.error.message);
      } else {
        setStatus("Login successful!");
      }
  };

  return (
    <div className="rounded-lg bg-slate-400 flex-col">
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...login("email", { required: "Email is required" })} type="text" placeholder="Username" className="input-md input-bordered w-full text-slate-300">
            </input>
            <input {...login("password", { required: "Password is required" })} type="password" placeholder="Password" className="input-md input-bordered w-full text-slate-300">
            </input>
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
        </form>
        <h5>Login Status: {status || ""}</h5>
    </div>
  )
}
