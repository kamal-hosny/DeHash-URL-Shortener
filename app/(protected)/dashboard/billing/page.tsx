"use client";

import { Check, CreditCard, Zap } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BillingPage() {
  // Mock user subscription data
  const subscription = {
    plan: "Free",
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: "2025-12-25",
    usage: {
      links: 12,
      limit: 50,
    },
  };

  const isPro = subscription.plan === "Pro";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan, billing details, and invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the <strong>{subscription.plan}</strong>{" "}
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${isPro ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{subscription.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {isPro ? "$5.00/month" : "Free Forever"}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
                  Active
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Link Usage</span>
                  <span className="font-medium">
                    {subscription.usage.links} / {subscription.usage.limit}{" "}
                    links
                  </span>
                </div>
                {/* Custom Progress Bar since we might not have the component installed yet */}
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(subscription.usage.links / subscription.usage.limit) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {subscription.usage.limit - subscription.usage.links} links
                  remaining in this cycle.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/20 pt-6">
              <Button variant={isPro ? "outline" : "default"}>
                {isPro ? "Manage Subscription" : "Upgrade to Pro"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your recent invoices and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-sm text-muted-foreground py-8 gap-2">
                <CreditCard className="w-8 h-8 opacity-50" />
                <p>No invoices found.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade / Features Card */}
        <div>
          <Card
            className={`h-full border-2 ${!isPro ? "border-primary/20 shadow-lg" : ""}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pro Plan</span>
                {!isPro && (
                  <span className="text-primary text-xl font-bold">
                    $5
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Unlock advanced features and higher limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                {[
                  "1,000 links per month",
                  "Advanced analytics & charts",
                  "Custom QR codes",
                  "Priority support",
                  "Link expiration control",
                  "API Access",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={isPro ? "secondary" : "default"}
                disabled={isPro}
              >
                {isPro ? "Current Plan" : "Upgrade Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
