"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  ExternalLink,
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
  useCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useApplyCouponMutation,
  useBillingQuery,
} from "@/hooks/queries/useBillingQuery";
import { useToast } from "@/hooks/useToast";
import { useSession } from "next-auth/react";
import { useAuthUser } from "@/store/authStore";
import { ShieldAlert } from "lucide-react";

export default function CouponsPage() {
  const { toast } = useToast();
  const { data: session, status: authStatus } = useSession();
  const authUser = useAuthUser();

  const isAdmin = Boolean(
    session?.user?.isAdmin ||
    session?.user?.role === "ADMIN" ||
    session?.user?.email?.toLowerCase() === "ixonhosny@gmail.com" ||
    authUser?.isAdmin ||
    authUser?.role === "ADMIN" ||
    authUser?.email?.toLowerCase() === "ixonhosny@gmail.com"
  );

  const { data: billingData, refetch: refetchBilling } = useBillingQuery();
  const { data: couponsData, isLoading, refetch: refetchCoupons } = useCouponsQuery({
    enabled: isAdmin,
  });

  const createMutation = useCreateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();
  const applyMutation = useApplyCouponMutation();

  // Fast redeem state
  const [redeemCode, setRedeemCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New coupon form state
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState<number>(100);
  const [newApplicableCycle, setNewApplicableCycle] = useState<"all" | "monthly" | "yearly">("yearly");
  const [newDescription, setNewDescription] = useState("");
  const [newMaxUses, setNewMaxUses] = useState<string>("");

  const currentPlan = billingData?.subscription?.plan || "FREE";
  const isPro = currentPlan === "PRO" || currentPlan === "ENTERPRISE";

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code Copied!",
      description: `Promo code "${code}" copied to clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRedeem = async (codeToRedeem?: string, couponCycle?: "all" | "monthly" | "yearly") => {
    const targetCode = (codeToRedeem || redeemCode).trim().toUpperCase();
    if (!targetCode) {
      toast({
        title: "Please enter a code",
        description: "Enter a valid discount promo code to redeem.",
        variant: "destructive",
      });
      return;
    }

    const targetBillingCycle =
      couponCycle === "monthly" ? "monthly" : "yearly";

    try {
      const res = await applyMutation.mutateAsync({
        code: targetCode,
        redeemDirectly: true,
        billingCycle: targetBillingCycle,
      });

      if (res.redeemed) {
        toast({
          title: "Subscription Activated Free!",
          description: res.message,
        });
        setRedeemCode("");
        refetchBilling();
        refetchCoupons();
      } else {
        toast({
          title: "Discount Code Valid",
          description: `${res.message} You can apply it on the Billing page during upgrade.`,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem code",
        variant: "destructive",
      });
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      toast({
        title: "Code required",
        description: "Please specify a coupon code name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: newCode.trim().toUpperCase(),
        discountPercent: Number(newDiscount),
        applicableCycle: newApplicableCycle,
        description: newDescription.trim() || undefined,
        maxUses: newMaxUses ? Number(newMaxUses) : null,
      });

      toast({
        title: "Coupon Created!",
        description: `Coupon "${newCode.toUpperCase()}" (${newApplicableCycle}) with ${newDiscount}% discount created.`,
      });

      setNewCode("");
      setNewDiscount(100);
      setNewApplicableCycle("yearly");
      setNewDescription("");
      setNewMaxUses("");
      setIsCreating(false);
      refetchCoupons();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Creation Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      await deleteMutation.mutateAsync(code);
      toast({
        title: "Coupon Deleted",
        description: `Coupon "${code}" has been removed.`,
      });
      refetchCoupons();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const coupons = couponsData?.coupons || [];

  if (authStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <span className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Verifying administrator permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto py-16 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Administrator Access Only
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This discount management portal is restricted to platform administrators. Regular members can apply promotional discount codes directly on the Billing page during checkout.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-3">
          <Button variant="outline" asChild size="sm" className="text-xs">
            <Link href="/dashboard/billing">
              <ArrowLeft size={14} /> Back to Billing
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground h-8 text-xs"
        >
          <Link href="/dashboard/billing">
            <ArrowLeft size={14} /> Back to Billing & Subscription
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Discount & Promo Codes
              </h1>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1.5">
                <Sparkles size={12} />
                100% Free Promo System
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage promotional discount codes. Applying any 100% discount code grants an immediate free Pro subscription.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreating(true)}
              className="gap-2 text-xs h-9"
            >
              <Plus size={15} />
              Create New Code
            </Button>
            <Button variant="outline" asChild className="gap-2 text-xs h-9">
              <Link href="/dashboard/billing">
                View My Subscription <ExternalLink size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Redeem Banner */}
      <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5" />
            Redeem Discount Code
          </CardTitle>
          <CardDescription>
            Enter a promo code below. If it offers a <strong>100% discount</strong> (like{" "}
            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-xs">
              FREE100
            </code>
            ), your account will be upgraded to <strong>PRO for free</strong> immediately!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              placeholder="e.g. FREE100 or DEHASH100"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm uppercase font-mono tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button
              onClick={() => handleRedeem()}
              disabled={applyMutation.isPending || !redeemCode.trim()}
              className="whitespace-nowrap gap-1.5"
            >
              {applyMutation.isPending ? "Validating..." : "Redeem Code"}
            </Button>
          </div>

          {isPro && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1.5 font-medium">
              <Check size={14} /> You are currently on the Pro plan with 1,000 links limit!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create New Coupon Dialog / Popup Modal */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateCoupon}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="text-primary w-5 h-5" />
                Create New Discount Code
              </DialogTitle>
              <DialogDescription className="text-xs">
                Define a custom promotional code, discount percentage, and usage limits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Code Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAUNCH100 or VIPFREE"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Discount Percentage
                  </label>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      newDiscount === 100
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {newDiscount}% {newDiscount === 100 ? "• FREE PRO" : "OFF"}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <div className="flex gap-1.5">
                    {[100, 50, 25, 10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewDiscount(preset)}
                        className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                          newDiscount === preset
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applicable Plan / Billing Cycle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Applicable Plan / Cycle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewApplicableCycle("yearly")}
                    className={`py-2 px-2.5 rounded-md text-xs font-medium border text-center transition-all ${
                      newApplicableCycle === "yearly"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Yearly ($9/mo • 2,000 links)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewApplicableCycle("monthly")}
                    className={`py-2 px-2.5 rounded-md text-xs font-medium border text-center transition-all ${
                      newApplicableCycle === "monthly"
                        ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Monthly ($12/mo • 1,000 links)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewApplicableCycle("all")}
                    className={`py-2 px-2.5 rounded-md text-xs font-medium border text-center transition-all ${
                      newApplicableCycle === "all"
                        ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 font-bold"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All Plans
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Free Lifetime Access for Community"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Max Redemptions (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited redemptions"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="text-xs"
              >
                {createMutation.isPending ? "Creating..." : "Save & Publish Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active Discount Codes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Available Discount Codes ({coupons.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Click &quot;Redeem&quot; on any 100% code to activate Pro for free immediately
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
            <p className="text-sm">Loading discount codes...</p>
          </div>
        ) : coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const isFullDiscount = c.discountPercent === 100;
              return (
                <Card
                  key={c.id}
                  className={`border transition-all shadow-sm hover:shadow-md ${
                    isFullDiscount
                      ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/10"
                      : "border-border"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold tracking-wider text-foreground">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopy(c.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        <div className="mt-1">
                          {c.applicableCycle === "yearly" ? (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Yearly Only (2,000 links/mo)
                            </span>
                          ) : c.applicableCycle === "monthly" ? (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Monthly Only (1,000 links/mo)
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              All Plans (Monthly & Yearly)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {c.description || "Promotional Discount Code"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isFullDiscount
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isFullDiscount ? "100% OFF (FREE)" : `${c.discountPercent}% OFF`}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 text-xs space-y-2 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Redemptions:</span>
                      <span className="font-mono font-medium text-foreground">
                        {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : "uses"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Status:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    <Button
                      variant={isFullDiscount ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRedeem(c.code, c.applicableCycle)}
                      disabled={applyMutation.isPending || (isPro && isFullDiscount)}
                      className={`text-xs h-8 gap-1 flex-1 ${
                        isFullDiscount && !isPro
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : ""
                      }`}
                    >
                      {isFullDiscount ? (
                        <>
                          <Zap size={13} />
                          {isPro
                            ? "Pro Already Active"
                            : c.applicableCycle === "yearly"
                            ? "Redeem Free Yearly"
                            : c.applicableCycle === "monthly"
                            ? "Redeem Free Monthly"
                            : "Redeem 100% Free"}
                        </>
                      ) : (
                        "Redeem Code"
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      title="Delete code"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No active discount codes found.</p>
          </Card>
        )}
      </div>

      {/* Explanatory Info Card */}
      <Card className="bg-muted/20 border-border">
        <CardHeader>
          <CardTitle className="text-base">How 100% Free Subscriptions Work</CardTitle>
          <CardDescription className="text-xs leading-relaxed space-y-1">
            <span className="block">
              1. Any promo code configured with a <strong>100% discount</strong> completely waives the subscription price ($0.00).
            </span>
            <span className="block">
              2. You can redeem it directly on this page or during the checkout upgrade modal on the Billing page.
            </span>
            <span className="block">
              3. No payment gateway or credit card is required. Your account is immediately upgraded to <strong>PRO</strong> with 1,000 monthly link allocations.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

