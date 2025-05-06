import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jadon's Tech Services | Custom PCs & Computer Repair",
    template: "%s | Jadon's Tech Services"
  },
  description: "Professional computer repair services and custom-built PCs. Expert IT solutions, hardware repairs, and software troubleshooting at fair prices.",
  keywords: [
    "computer repair",
    "custom PC builder",
    "IT services",
    "tech support",
    "hardware repair",
    "software troubleshooting",
    "gaming PC",
    "computer maintenance"
  ],
  metadataBase: new URL('https://web.jadonstechservices.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Jadon's Tech Services | Custom PCs & Computer Repair",
    description: "Professional computer repair services and custom-built PCs. Expert IT solutions at fair prices.",
    url: 'https://web.jadonstechservices.com',
    siteName: "Jadon's Tech Services",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jadon\'s Tech Services - Professional IT Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jadon's Tech Services | Custom PCs & Computer Repair",
    description: "Professional computer repair services and custom-built PCs. Expert IT solutions at fair prices.",
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YRt-0An-4gM56KV8IQ62cjhwonAMIcJMs4UFKAL7GKE',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  authors: [
    {
      name: "Jadon Chenard",
      url: "https://web.jadonstechservices.com",
    },
  ],
  creator: "Jadon Chenard",
  publisher: "Jadon's Tech Services",
  category: 'Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="forest">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#317EFB" />
        <link rel="canonical" href="https://web.jadonstechservices.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Jadon's Tech Services",
            "image": "https://web.jadonstechservices.com/lib/logo.png",
            "@id": "",
            "url": "https://web.jadonstechservices.com",
            "telephone": "+1-YOUR-PHONE-NUMBER",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "25 Bedford Street",
              "addressLocality": "Portland",
              "addressRegion": "ME",
              "postalCode": "04101",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "YOUR_LATITUDE",
              "longitude": "YOUR_LONGITUDE"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "17:00"
            },
            "sameAs": [
              "YOUR_FACEBOOK_URL",
              "YOUR_TWITTER_URL",
              "YOUR_INSTAGRAM_URL",
              "YOUR_LINKEDIN_URL"
            ]
          })}
        </script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}