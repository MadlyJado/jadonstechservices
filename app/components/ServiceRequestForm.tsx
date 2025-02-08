// components/ServiceRequestForm.tsx

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ServiceRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<string>('');

  // Handle changes for both input and textarea fields
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
          <h2 className="card-title">Service Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Describe your service request"
              className="textarea textarea-bordered w-full"
              value={formData.message}
              onChange={handleChange}
              required
            />
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
