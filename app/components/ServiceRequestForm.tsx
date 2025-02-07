"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const services = [
  { id: "web_design", name: "Web Design" },
  { id: "seo", name: "SEO Optimization" },
  { id: "marketing", name: "Digital Marketing" },
];

export default function ServiceRequestForm() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");

  const handleRequest = async () => {
    if (!name || !email || !address || !phone) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const response = await fetch("/api/request-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        address,
        phone,
        service: selectedService.id,
        comments,
      }),
    });

    if (response.ok) {
      toast.success("Service request sent!");
    } else {
      toast.error("Failed to send request.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-base-200 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">Request a Service</h2>

      {/* Name Input */}
      <input
        type="text"
        placeholder="Full Name"
        className="input input-bordered w-full max-w-xs"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Email Input */}
      <input
        type="email"
        placeholder="Your Email"
        className="input input-bordered w-full max-w-xs"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Address Input */}
      <input
        type="text"
        placeholder="Home Address"
        className="input input-bordered w-full max-w-xs"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />

      {/* Phone Number Input */}
      <input
        type="tel"
        placeholder="Phone Number"
        className="input input-bordered w-full max-w-xs"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      {/* DaisyUI Dropdown */}
      <div className="dropdown w-full max-w-xs">
        <label tabIndex={0} className="btn btn-outline w-full">
          {selectedService.name}
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
          {services.map((service) => (
            <li key={service.id} onClick={() => setSelectedService(service)}>
              <a>{service.name}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Comments Textarea */}
      <textarea
        placeholder="Additional comments or details..."
        className="textarea textarea-bordered w-full max-w-xs"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      <Button onClick={handleRequest} className="btn btn-primary">
        Request Service
      </Button>
    </div>
  );
}