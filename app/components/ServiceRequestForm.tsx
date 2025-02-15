'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ServiceRequestForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [status, setStatus] = useState<string>('');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('Request sent successfully!');
      } else {
        setStatus('Error sending request.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('Error sending request.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-slate-400">Service Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              placeholder="Name"
              className="input input-bordered w-full text-slate-500"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address"
                }
              })}
              type="email"
              placeholder="Email"
              className="input input-bordered w-full text-slate-300"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            <textarea
              {...register("message", { required: "Message is required" })}
              placeholder="Describe your service request"
              className="textarea textarea-bordered w-full text-slate-300"
            />
            {errors.message && <p className="text-red-500">{errors.message.message}</p>}
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
          </form>
          {status && <p className="text-center mt-4">{status}</p>}
        </div>
      </div>
    </div>
  );
}
