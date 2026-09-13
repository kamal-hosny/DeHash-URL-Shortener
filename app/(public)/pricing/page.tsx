
"use client";

import Link from "next/link";
import { BarChart3, Check, Layers, Shield, Sparkles } from "@/assets/icons";
import Pricing from "@/components/molecules/home/Pricing";
import FAQ from "@/components/molecules/home/FAQ";



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


const IndexPage = () => {


  return (
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
                <h4 className="text-xl font-semibold">Everything you need to win</h4>
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
                    <h5 className="font-semibold mb-2">{perk.title}</h5>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/50 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-8 shadow-2xl">
            <h4 className="text-2xl font-semibold mb-4">Built for teams</h4>
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
  );
};

export default IndexPage;