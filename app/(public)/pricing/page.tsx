import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Check, Layers, Shield, Sparkles } from "@/assets/icons";
import Pricing from "@/components/molecules/home/Pricing";
import FAQ from "@/components/molecules/home/FAQ";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { faqs, plans } from "@/data";

export const metadata: Metadata = {
  title: "Pricing Plans & Subscriptions | DeHash URL Shortener",
  description:
    "Explore transparent, flexible pricing for DeHash. Choose between our free starter tier or upgrade to Pro for 2,000 links/mo, extended analytics, and expired link recovery.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing Plans & Subscriptions | DeHash",
    description:
      "Simple, predictable pricing with zero lock-in. Free starter plan with 50 links/mo, or Pro plan with 2,000 links, QR codes, and advanced analytics.",
    url: `${siteConfig.url}/pricing`,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Pricing Plans & Subscriptions | DeHash",
      },
    ],
  },
};

const platformPerks = [
  {
    title: "Security-first infra",
    description:
      "Enterprise-grade encryption, bot protection, and continuous monitoring keep every redirect safe.",
    icon: Shield,
  },
  {
    title: "Insights that matter",
    description:
      "Realtime dashboards expose trends, drop-offs, and campaign wins across every workspace.",
    icon: BarChart3,
  },
  {
    title: "Collaboration ready",
    description:
      "Assign teammates, manage permissions, and streamline reviews without leaving the dashboard.",
    icon: Layers,
  },
];

export default function PricingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "DeHash Link Management Platform",
    description:
      "URL shortening, QR code generation, click tracking, and custom domain management.",
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: `${plan.name} Plan`,
      description: plan.description,
      price: plan.price.monthly !== null ? plan.price.monthly.toString() : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/pricing`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing",
        item: `${siteConfig.url}/pricing`,
      },
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
      <JsonLd data={[productSchema, breadcrumbSchema, faqSchema]} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-0 w-72 h-72 bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 -left-10 w-80 h-80 bg-accent/10 blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <section className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Pricing built for every growth stage
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Predictable pricing, <span className="text-primary">zero lock-in</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Launch your first short link for free, then graduate into collaborative
              workspaces, deeper analytics, and enterprise controls without
              rebuilding workflows.
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              99.9% uptime SLA • GDPR-ready • SOC 2 compliant
            </div>
          </section>

          <Pricing />

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr] mb-20">
            <div className="rounded-3xl border border-border/60 bg-background/70 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Platform perks
                  </p>
                  <h2 className="text-xl font-semibold">Everything you need to win</h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {platformPerks.map((perk) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={perk.title}
                      className="rounded-2xl border border-border/50 p-5 bg-muted/40"
                    >
                      <Icon className="h-5 w-5 text-primary mb-4" />
                      <h3 className="font-semibold mb-2">{perk.title}</h3>
                      <p className="text-sm text-muted-foreground">{perk.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/50 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4">Built for teams</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Share projects, manage approvals, and keep brand assets aligned. Add or
                remove seats with one click.
              </p>
              <ul className="space-y-4 mb-8">
                {["Unlimited workspaces", "Role-based access", "Audit-ready exports"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground px-5 py-3 font-semibold hover:bg-primary/90 transition w-full"
              >
                Book a live demo
              </Link>
            </div>
          </section>

          <FAQ />
        </div>
      </div>
    </>
  );
}