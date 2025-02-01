import Image from "next/image";
import NavBar from "./components/NavBar";
import logo from "./lib/logo.png";

export default function Home() {
  return (
    <body className="bg-gradient-to-r from-cyan-600 to-amber-800">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
        
          <div className="text-center mb-8">
          <Image
              src={logo}
              alt="Jadon's Tech Services Logo"
              width={500}
              height={300}
              className="mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Jadon's Tech Services!</h1>
            <p className="text-xl text-secondary">Expert IT Solutions for Your Computer Needs</p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
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
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-cyan-600 mb-4">I will NEVER overcharge you</h2>
          </div>
        </div>
      </main>
    </body>
  );
}