'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Head from 'next/head';

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
    <>
      <Head>
        <title>Service Request Form | Jadon's Tech Services</title>
        <meta name="description" content="Submit your IT service request form for fast and reliable computer repair services." />
      </Head>
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-slate-400 text-2xl">Service Request</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-labelledby="service-request-heading">
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full text-slate-500"
                  aria-required="true"
                />
                {errors.name && <p className="text-red-500" role="alert">{errors.name.message}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
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
                  aria-required="true"
                />
                {errors.email && <p className="text-red-500" role="alert">{errors.email.message}</p>}
              </div>
              
              <div>
                <label htmlFor="message" className="sr-only">Service Request Details</label>
                <textarea
                  id="message"
                  {...register("message", { required: "Message is required" })}
                  placeholder="Describe your service request"
                  className="textarea textarea-bordered w-full text-slate-300"
                  aria-required="true"
                />
                {errors.message && <p className="text-red-500" role="alert">{errors.message.message}</p>}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                aria-label="Submit service request"
              >
                Submit Request
              </button>
            </form>
            {status && <p className="text-center mt-4" role="status">{status}</p>}
          </div>
        </div>
      </div>
    </>
  );
}