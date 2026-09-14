import type { Metadata } from "next";
import FAQ from "@/components/molecules/home/FAQ";
import Features from "@/components/molecules/home/Features";
import Hero from "@/components/molecules/home/Hero";
import Pricing from "@/components/molecules/home/Pricing";
import Testimonials from "@/components/molecules/home/Testimonials";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { faqs } from "@/data";

export const metadata: Metadata = {
  title: "DeHash - Free Modern URL Shortener & Dynamic QR Code Generator",
  description:
    "Shorten links, create high-resolution QR codes, track deep click analytics, and protect links with expiration dates. Fast, reliable, and secure URL shortening service.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DeHash - Free Modern URL Shortener & Dynamic QR Code Generator",
    description:
      "Transform long, clumsy URLs into clean, trackable links and branded QR codes in seconds. Complete with visitor insights and security controls.",
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "DeHash - Free Modern URL Shortener & Dynamic QR Code Generator",
      },
    ],
  },
};

export default function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/?url={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DeHash URL Shortener",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    url: siteConfig.url,
    offers: [
      {
        "@type": "Offer",
        name: "Free Starter Plan",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "12",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "840",
      bestRating: "5",
    },
    featureList: [
      "Instant URL Shortening",
      "Dynamic QR Code Generator",
      "Real-time Click & Visitor Analytics",
      "Link Expiration Rules",
      "Duplicate Link Quota Protection",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.github,
      siteConfig.links.linkedin,
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={[websiteSchema, softwareSchema, organizationSchema, faqSchema]} />
      <div className="container mx-auto">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </div>
    </>
  );
}
