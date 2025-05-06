import NavBar from "../components/NavBar";
import ServiceRequestForm from "../components/ServiceRequestForm";
import Head from "next/head";

export default function Services() {
    return (
      <>
        <Head>
          <title>IT Service Request | Jadon's Tech Services</title>
          <meta name="description" content="Request professional computer repair and IT services. Fast, reliable, and affordable tech support for all your needs." />
          <meta name="keywords" content="computer repair service request, IT support request, tech help form, computer troubleshooting request" />
          <meta property="og:title" content="IT Service Request | Jadon's Tech Services" />
          <meta property="og:description" content="Request professional computer repair and IT services. Fast, reliable, and affordable tech support." />
          <link rel="canonical" href="https:/web.jadonstechservices.com/services" />
        </Head>
        
        <div className="bg-gradient-to-l from-amber-600 to-yellow-400">
          <NavBar />
          <ServiceRequestForm/>
        </div>
      </>
    );
}