"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Zap,
  Sparkles,
  ArrowRight,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBillingQuery,
  useUpgradeMutation,
  useCancelSubscriptionMutation,
  useApplyCouponMutation,
  useTopUpMutation,
} from "@/hooks/queries/useBillingQuery";
import { useToast } from "@/hooks/useToast";
import { useSession } from "next-auth/react";
import { useAuthUser } from "@/store/authStore";
import { AlertTriangle, Clock, Layers, PlusCircle, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const authUser = useAuthUser();

  const isAdmin = Boolean(
    session?.user?.isAdmin ||
    session?.user?.role === "ADMIN" ||
    session?.user?.email?.toLowerCase() === "ixonhosny@gmail.com" ||
    authUser?.isAdmin ||
    authUser?.role === "ADMIN" ||
    authUser?.email?.toLowerCase() === "ixonhosny@gmail.com"
  );

  const { data, isLoading, refetch } = useBillingQuery();
  const upgradeMutation = useUpgradeMutation();
  const cancelMutation = useCancelSubscriptionMutation();
  const applyMutation = useApplyCouponMutation();
  const topUpMutation = useTopUpMutation();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<"monthly" | "yearly">("yearly");
  const [modalCouponInput, setModalCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    applicableCycle?: "all" | "monthly" | "yearly";
  } | null>(null);

  // Quick coupon on the sidebar card
  const [quickCoupon, setQuickCoupon] = useState("");

  const subscription = data?.subscription || {
    plan: "FREE",
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: "N/A",
    allocatedQuota: 50,
    priorLinksCount: 0,
    cycleUsedCount: 0,
    remainingInCycle: 50,
    isCapReached: false,
    maxCap: 10000,
    usage: {
      links: 0,
      limit: 50,
      percentage: 0,
    },
  };

  const invoices = data?.invoices || [];
  const isPro = subscription.plan === "PRO" || subscription.plan === "ENTERPRISE";

  // Upgrade Modal price calculation
  // Yearly = $9/mo * 12 = $108 billed annually; Monthly = $12/mo
  const standardPrice = selectedCycle === "yearly" ? 108 : 12;
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (standardPrice * discountPercent) / 100;
  const finalPrice = Math.max(standardPrice - discountAmount, 0);
  const isFreeUpgrade = discountPercent === 100 || finalPrice === 0;

  // Cycle switcher that enforces coupon compatibility
  const switchCycle = (newCycle: "monthly" | "yearly") => {
    setSelectedCycle(newCycle);
    if (
      appliedCoupon?.applicableCycle &&
      appliedCoupon.applicableCycle !== "all" &&
      appliedCoupon.applicableCycle !== newCycle
    ) {
      const removedCode = appliedCoupon.code;
      const allowedCycle = appliedCoupon.applicableCycle === "yearly" ? "Yearly" : "Monthly";
      setAppliedCoupon(null);
      setModalCouponInput("");
      toast({
        title: "Coupon Removed",
        description: `Promo code "${removedCode}" is valid only for ${allowedCycle} subscriptions and was cleared.`,
        variant: "destructive",
      });
    }
  };

  // Handle applying coupon in modal with cycle check
  const handleApplyModalCoupon = async () => {
    const code = modalCouponInput.trim().toUpperCase();
    if (!code) {
      toast({
        title: "Please enter a code",
        description: "Type a discount promo code to apply.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await applyMutation.mutateAsync({
        code,
        redeemDirectly: false,
        billingCycle: selectedCycle,
      });

      if (res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountPercent: res.coupon.discountPercent,
          applicableCycle: res.coupon.applicableCycle || "all",
        });
        toast({
          title: "Promo Code Applied!",
          description: `Code "${res.coupon.code}" gave you ${res.coupon.discountPercent}% OFF on your ${selectedCycle === "yearly" ? "Yearly" : "Monthly"} subscription!`,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Invalid Code",
        description: error.message || "Failed to apply code",
        variant: "destructive",
      });
    }
  };

  // Handle Confirm Upgrade
  const handleConfirmUpgrade = async () => {
    try {
      const res = await upgradeMutation.mutateAsync({
        plan: "PRO",
        couponCode: appliedCoupon?.code,
        billingCycle: selectedCycle,
      });

      toast({
        title: "🎉 Plan Activated!",
        description: res.message,
      });

      setIsUpgradeModalOpen(false);
      setAppliedCoupon(null);
      setModalCouponInput("");
      refetch();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Upgrade Error",
        description: error.message || "Could not complete upgrade",
        variant: "destructive",
      });
    }
  };

  // Handle Confirm Top-Up
  const handleConfirmTopUp = async () => {
    try {
      const res = await topUpMutation.mutateAsync(1000);
      toast({
        title: "Points Topped Up!",
        description: res.message,
      });
      setIsTopUpModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Top-Up Failed",
        description: error.message || "Could not add points",
        variant: "destructive",
      });
    }
  };

  // Handle Downgrade / Cancel
  const handleConfirmDowngrade = async () => {
    try {
      const res = await cancelMutation.mutateAsync();
      toast({
        title: "Subscription Updated",
        description: res.message,
      });
      setIsDowngradeModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  // Quick redeem directly from side card
  const handleQuickRedeem = async () => {
    const code = quickCoupon.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await applyMutation.mutateAsync({ code, redeemDirectly: true });
      if (res.redeemed) {
        toast({
          title: "🎉 Pro Activated For Free!",
          description: res.message,
        });
        setQuickCoupon("");
        refetch();
      } else {
        // Auto-switch modal cycle to match coupon applicability
        if (res.coupon?.applicableCycle === "yearly") {
          setSelectedCycle("yearly");
        } else if (res.coupon?.applicableCycle === "monthly") {
          setSelectedCycle("monthly");
        }

        setAppliedCoupon({
          code: res.coupon!.code,
          discountPercent: res.coupon!.discountPercent,
          applicableCycle: res.coupon!.applicableCycle || "all",
        });
        setModalCouponInput(res.coupon!.code);
        setIsUpgradeModalOpen(true);
        setQuickCoupon("");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Code Error",
        description: error.message || "Invalid coupon code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Billing & Subscription
            </h1>
            <span
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full ${
                isPro
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {subscription.plan} Plan
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your subscription cycle, link quota points, top-ups up to 10,000 points, and discount codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Button variant="outline" asChild className="gap-2 text-xs h-9">
              <Link href="/dashboard/billing/coupons">
                <Sparkles size={14} className="text-primary" />
                Discount Codes (Admin)
              </Link>
            </Button>
          )}
          {!isPro && (
            <Button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="gap-2 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Zap size={14} />
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Current Plan & Invoices */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Subscription & Quota</CardTitle>
                  <CardDescription>
                    You are currently subscribed to the{" "}
                    <strong>
                      {subscription.plan}{" "}
                      {isPro && `(${subscription.billingCycle === "yearly" ? "Yearly" : "Monthly"})`}
                    </strong>{" "}
                    tier.
                  </CardDescription>
                </div>
                {isPro && (
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                    <Clock size={12} />
                    {subscription.daysRemaining !== undefined
                      ? `${subscription.daysRemaining} days left in cycle`
                      : "30-Day Cycle"}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/40 rounded-lg border border-border gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-full ${
                      isPro
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Zap size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {subscription.plan} Plan
                      {isPro && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({subscription.billingCycle === "yearly" ? "2,000 links / month" : "1,000 links / month"})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPro
                        ? `${
                            subscription.billingCycle === "yearly"
                              ? "$9.00 / month ($108 billed annually)"
                              : "$12.00 / month"
                          } • 30-day cycle renews ${subscription.nextBillingDate}`
                        : "Free Forever (up to 50 links)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.isCapReached && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ★ 10,000 Cap Reached
                    </span>
                  )}
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ● Active
                  </div>
                </div>
              </div>

              {/* Real Link Usage & Cycle Quota */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    {isPro ? "Current 30-Day Cycle Usage" : "Short Link Quota Usage"}
                  </span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {isPro
                      ? `${subscription.cycleUsedCount} / ${subscription.allocatedQuota?.toLocaleString()} links this cycle (${subscription.usage.percentage}%)`
                      : `${subscription.usage.links} / ${subscription.usage.limit.toLocaleString()} links (${subscription.usage.percentage}%)`}
                  </span>
                </div>

                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      subscription.usage.percentage > 85
                        ? "bg-rose-500"
                        : isPro
                        ? "bg-emerald-500"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(subscription.usage.percentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-background rounded-md border border-border">
                    <span className="text-muted-foreground block text-[11px]">Remaining This Cycle</span>
                    <span className="font-semibold text-sm text-foreground font-mono">
                      {subscription.remainingInCycle?.toLocaleString() ?? 0} links
                    </span>
                  </div>
                  <div className="p-2.5 bg-background rounded-md border border-border">
                    <span className="text-muted-foreground block text-[11px]">Free/Past Preserved Links</span>
                    <span className="font-semibold text-sm text-foreground font-mono">
                      {subscription.priorLinksCount?.toLocaleString() ?? 0} links
                    </span>
                  </div>
                  <div className="p-2.5 bg-background rounded-md border border-border">
                    <span className="text-muted-foreground block text-[11px]">Total Account Capacity</span>
                    <span className="font-semibold text-sm text-foreground font-mono">
                      {subscription.usage.limit?.toLocaleString() ?? 50} links
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  {isPro ? (
                    <>
                      💡 <strong>Zero Penalty Guarantee:</strong> Links created under the Free plan or previous months do NOT consume your current cycle points. Each cycle lasts 30 days. You can top-up additional points anytime up to the 10,000 points ceiling.
                    </>
                  ) : (
                    "When you upgrade to Pro, all your existing links are preserved with zero penalty, and you receive a fresh 1,000 or 2,000 link quota."
                  )}
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border bg-muted/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {isPro
                  ? `Allocated: ${subscription.allocatedQuota?.toLocaleString()} links (Max limit: 10,000)`
                  : "Need more capacity? Upgrade to Pro for 1,000 or 2,000 links/mo."}
              </span>
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTopUpModalOpen(true)}
                      disabled={subscription.isCapReached || subscription.allocatedQuota >= 10000}
                      className="text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <PlusCircle size={14} />
                      {subscription.isCapReached ? "10,000 Max Cap" : "Top-Up (+1,000 Links)"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDowngradeModalOpen(true)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Downgrade to Free
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Zap size={14} /> Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Billing Invoices History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing History & Invoices</CardTitle>
                <CardDescription>
                  View your recent subscription charges, invoices, and promo redemptions.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/20">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-md">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Promo / Coupon</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3 rounded-r-md">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors text-xs">
                          <td className="py-3 px-3 font-mono font-medium text-foreground whitespace-nowrap">
                            {inv.id}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                            {new Date(inv.createdAt).toLocaleDateString([], {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">
                            {inv.plan} Plan
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {inv.couponCode ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                                {inv.couponCode}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                            {inv.amount === 0 ? "$0.00 (Free)" : `$${inv.amount}.00`}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              ● Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-sm text-muted-foreground py-10 gap-2">
                  <CreditCard className="w-9 h-9 opacity-40" />
                  <p className="font-medium text-foreground text-xs">No invoices recorded yet</p>
                  <p className="text-xs text-muted-foreground/80">
                    When you upgrade or apply promo codes, your invoices will be listed here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pro Plan Card & Promo Code Box */}
        <div className="space-y-6">
          {/* Pro Plan Feature Card */}
          <Card className={`border-2 ${!isPro ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  ★ Most Popular
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Save 25% Annually
                </span>
              </div>
              <CardTitle className="pt-2 flex items-baseline justify-between">
                <span>Pro Tier</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">$9</span>
                  <span className="text-xs text-muted-foreground">/mo billed yearly</span>
                </div>
              </CardTitle>
              <CardDescription className="text-xs">
                Scale campaigns with richer analytics, automation, and 2,000 links/mo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="p-2.5 bg-muted/40 rounded-lg border border-border text-xs flex justify-between items-center">
                <span className="text-muted-foreground">Or Monthly Billing:</span>
                <span className="font-semibold text-foreground">$12 / mo (1,000 links)</span>
              </div>

              <ul className="space-y-2 text-xs">
                {[
                  "2,000 short links / month (Yearly) or 1,000 / mo (Monthly)",
                  "Zero Penalty: Existing Free links carried over",
                  "30-day freshness cycle with auto-refresh",
                  "Top-up points anytime up to 10,000 ceiling",
                  "Custom branded domains",
                  "Extended analytics (90-day history)",
                  "Priority inbox support",
                  "Bulk upload & API access",
                  "Live Visitor Activity stream & full logs",
                  "CSV export of all click records",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/90">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              {isPro ? (
                <Button
                  className="w-full text-xs gap-1.5"
                  variant="outline"
                  onClick={() => setIsTopUpModalOpen(true)}
                  disabled={subscription.isCapReached || subscription.allocatedQuota >= 10000}
                >
                  <PlusCircle size={14} />
                  {subscription.isCapReached ? "10,000 Max Quota Reached" : "Top-Up Quota (+1,000 Links)"}
                </Button>
              ) : (
                <Button
                  className="w-full text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  <Zap size={14} /> Upgrade to Pro
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Quick Promo Code Box */}
          <Card className="border-border shadow-sm bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Have a Promo Code?
              </CardTitle>
              <CardDescription className="text-xs">
                Enter a code like <code className="font-mono text-primary">FREE100</code> to subscribe for free.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FREE100"
                  value={quickCoupon}
                  onChange={(e) => setQuickCoupon(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs uppercase font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  size="sm"
                  onClick={handleQuickRedeem}
                  disabled={applyMutation.isPending || !quickCoupon.trim()}
                  className="text-xs h-8 px-3"
                >
                  Apply
                </Button>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-border/50">
                  <Link
                    href="/dashboard/billing/coupons"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Manage discount codes (Admin) <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Upgrade / Checkout Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="text-primary w-5 h-5" />
              Upgrade to Pro Plan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select your billing cycle. Existing Free links are preserved with zero penalty!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cycle Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => switchCycle("yearly")}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                  selectedCycle === "yearly"
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>Yearly</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded-full">
                    Best Value
                  </span>
                </div>
                <span className="text-[11px] font-normal text-muted-foreground">
                  $9/mo • 2,000 links/mo
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchCycle("monthly")}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                  selectedCycle === "monthly"
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>Monthly</span>
                </div>
                <span className="text-[11px] font-normal text-muted-foreground">
                  $12/mo • 1,000 links/mo
                </span>
              </button>
            </div>

            {/* Plan Info Details */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-semibold">
                <span>
                  {selectedCycle === "yearly" ? "Pro Plan Yearly" : "Pro Plan Monthly"}
                </span>
                <span>
                  {selectedCycle === "yearly" ? "$108.00 / year ($9/mo)" : "$12.00 / month"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {selectedCycle === "yearly"
                  ? "Grants 2,000 fresh links every 30 days for 1 full year. Preserves all existing links!"
                  : "Grants 1,000 fresh links every 30 days. Cancel or top-up anytime."}
              </p>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Have a discount promo code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. YEARLY100, MONTHLY100, or FREE100"
                  value={modalCouponInput}
                  onChange={(e) => setModalCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-xs uppercase font-mono tracking-wider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleApplyModalCoupon}
                  disabled={applyMutation.isPending || !modalCouponInput.trim()}
                  className="text-xs h-9"
                >
                  Apply Code
                </Button>
              </div>
            </div>

            {/* Applied Discount Banner */}
            {appliedCoupon && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  isFreeUpgrade
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-primary/10 border-primary/30 text-primary"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>
                    🎉 Code &quot;{appliedCoupon.code}&quot; Applied for {selectedCycle === "yearly" ? "Yearly" : "Monthly"} Plan!
                  </span>
                  <span>{appliedCoupon.discountPercent}% OFF</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-muted-foreground">Plan applicability:</span>
                  <span className="font-semibold underline">
                    {appliedCoupon.applicableCycle === "yearly"
                      ? "Yearly Subscription Only ($9/mo • 2,000 links/mo)"
                      : appliedCoupon.applicableCycle === "monthly"
                      ? "Monthly Subscription Only ($12/mo • 1,000 links/mo)"
                      : "All Plans (Both Yearly & Monthly)"}
                  </span>
                </div>
                {isFreeUpgrade && (
                  <p className="text-[11px] opacity-90">
                    100% discount granted! No credit card or payment is required.
                  </p>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="pt-3 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Standard Price:</span>
                <span>${standardPrice}.00</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon.discountPercent}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
                <span>Total Due Today:</span>
                <span className={isFreeUpgrade ? "text-emerald-600 dark:text-emerald-400 text-base" : ""}>
                  {isFreeUpgrade ? "$0.00 (FREE)" : `$${finalPrice.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={upgradeMutation.isPending}
              className={`text-xs gap-1.5 ${
                isFreeUpgrade
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }`}
            >
              {upgradeMutation.isPending ? (
                "Processing..."
              ) : isFreeUpgrade ? (
                <>
                  <Zap size={14} /> Activate Free Pro (100% OFF)
                </>
              ) : (
                `Complete Upgrade ($${finalPrice.toFixed(2)})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-Up Quota Modal */}
      <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="text-primary w-5 h-5" />
              Top-Up Short Link Points
            </DialogTitle>
            <DialogDescription className="text-xs">
              Stack additional link quota onto your current 30-day cycle up to the 10,000 points maximum ceiling.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Cycle Quota:</span>
                <span className="font-mono font-semibold">{subscription.allocatedQuota?.toLocaleString()} links</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Adding:</span>
                <span className="font-mono font-bold">+1,000 links</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                <span>New Cycle Quota:</span>
                <span className="font-mono text-primary">
                  {Math.min((subscription.allocatedQuota || 0) + 1000, 10000).toLocaleString()} links
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded bg-primary/10 text-primary text-[11px]">
              <ShieldCheck size={16} className="shrink-0" />
              <span>
                Maximum limit: <strong>10,000 links</strong>. Points added remain valid for the remainder of your active 30-day cycle.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTopUpModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmTopUp}
              disabled={topUpMutation.isPending || subscription.allocatedQuota >= 10000}
              className="text-xs gap-1.5"
            >
              {topUpMutation.isPending ? "Adding Points..." : "Confirm Top-Up (+1,000 Links)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Confirmation Modal */}
      <Dialog open={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-lg">
              Downgrade to Free Plan?
            </DialogTitle>
            <DialogDescription className="text-xs pt-1 text-muted-foreground">
              Are you sure you want to downgrade your account from <strong>Pro</strong> to the <strong>Free</strong> tier?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 bg-muted/40 rounded-lg border border-border text-xs space-y-2">
            <p className="font-semibold text-foreground">What happens when you downgrade:</p>
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Your short link creation limit will decrease to <strong>50 links</strong>.</li>
              <li>Existing shortened links will remain active and continue working normally.</li>
              <li>You will lose access to extended live visitor activity logs.</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDowngradeModalOpen(false)}
              className="text-xs"
            >
              Keep Pro Plan
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDowngrade}
              disabled={cancelMutation.isPending}
              className="text-xs gap-1.5"
            >
              {cancelMutation.isPending ? "Downgrading..." : "Yes, Downgrade to Free"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
