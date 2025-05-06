'use client';

import Image from "next/image";
import logo from "./lib/logo.png";
import NavBar from "./components/NavBar";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Jadon's Tech Services | Expert IT Solutions & Computer Repair</title>
        <meta name="description" content="Professional computer repair and IT services by Jadon Chenard. Hardware fixes, software troubleshooting, and custom computer building at fair prices." />
        <meta name="keywords" content="computer repair, IT services, tech support, hardware repair, software troubleshooting, custom computer building" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Jadon Chenard" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://web.jadonstechservices.com/" />
        <meta property="og:title" content="Jadon's Tech Services | Expert IT Solutions & Computer Repair" />
        <meta property="og:description" content="Professional computer repair and IT services by Jadon Chenard. Hardware fixes, software troubleshooting, and custom computer building at fair prices." />
        <meta property="og:image" content="https://web.jadonstechservices.com/lib/logo.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://web.jadonstechservices.com/" />
        <meta property="twitter:title" content="Jadon's Tech Services | Expert IT Solutions & Computer Repair" />
        <meta property="twitter:description" content="Professional computer repair and IT services by Jadon Chenard. Hardware fixes, software troubleshooting, and custom computer building at fair prices." />
        <meta property="twitter:image" content="https://web.jadonstechservices.com/lib/logo.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://web.jadonstechservices.com/" />
      </Head>

      <div className="bg-base-100">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Image
                src={logo}
                alt="Jadon's Tech Services Logo - Professional IT Solutions and Computer Repair Services"
                width={500}
                height={300}
                className="mx-auto mb-4"
                priority
              />
              <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Jadon's Tech Services!</h1>
              <p className="text-xl text-secondary">Expert IT Solutions for Your Computer Needs</p>
            </div>

            <section className="bg-secondary-content p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">About Me</h2>
              <p className="text-secondary mb-4">
                My name is Jadon Chenard. I'm an IT major with several years of experience in fixing computers and laptops, both hardware and software!
              </p>
              <p className="text-secondary mb-4">
                I specialize in troubleshooting and resolving issues related to:
              </p>
              <ul className="list-disc list-inside text-secondary mb-4">
                <li>Network connectivity</li>
                <li>Software bugs</li>
                <li>Hardware malfunctions</li>
                <li>Custom computer building</li>
              </ul>
              <p className="text-secondary">
                I am always here to help you with your computer needs. My motto is to always strive for honesty, helpfulness, and to always try my best. This also applies to my software and hardware support!
              </p>
            </section>

            <section className="text-center">
              <h2 className="text-3xl font-bold text-cyan-600 mb-4">I will NEVER overcharge you</h2>
            </section>
            
            <section className="rounded-lg bg-secondary-content flex-col col-auto shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Testimonials</h2>
              <blockquote className="text-secondary text-base mb-8">
                "It's so easy to contact Jadon for help! All I have to do is visit the service request page!" <cite>- Jimbob Jones</cite>
              </blockquote>
              <blockquote className="text-secondary text-base mb-8">
                "The website looks very professional, Jadon made it easy to have someone build a computer for me!" <cite>- Gerald Benard</cite>
              </blockquote>
              <blockquote className="text-secondary text-base mb-8">
                "The website is easy to use!" <cite>- Rex Holland</cite>
              </blockquote>
              <blockquote className="text-secondary text-base mb-8">
                "Jadon, the owner of Jadons tech services, has always been kind to me as a customer, never overcharging me ONCE! He truly never overcharges ANYONE!" <cite>- Kim Young</cite>
              </blockquote>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}