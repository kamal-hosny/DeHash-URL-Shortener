"use client";

import { Check } from "@/assets/icons";
import { plans as pricingPlans } from "@/data";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useAuthUser } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AuthRequiredModal } from "../pricing/AuthRequiredModal";

const Pricing = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authUser = useAuthUser();

  const isAuthenticated = status === "authenticated" || Boolean(authUser);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<{
    name: string;
    price?: string;
  }>({ name: "Pro" });

  const savingsLabel = useMemo(
    () => (billingCycle === "yearly" ? "Save 25%" : "Pay monthly"),
    [billingCycle]
  );

  const handlePlanSelect = (
    plan: (typeof pricingPlans)[0],
    displayPrice: string,
    priceSuffix: string
  ) => {
    if (!isAuthenticated) {
      setSelectedPlanForModal({
        name: plan.name,
        price: `${displayPrice} ${priceSuffix}`.trim(),
      });
      setIsAuthModalOpen(true);
      return;
    }

    // Authenticated user: redirect to dashboard billing
    const planSlug = plan.name.toLowerCase();
    router.push(`/dashboard/billing?plan=${planSlug}&cycle=${billingCycle}`);
  };

  return (
    <>
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        planName={selectedPlanForModal.name}
        billingCycle={billingCycle}
        planPrice={selectedPlanForModal.price}
      />

      <section className="py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Billing Cycle Switcher */}
          <section className="mb-20">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 px-1 py-1 rounded-full bg-muted">
                {["monthly", "yearly"].map((cycle) => (
                  <Button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle as "monthly" | "yearly")}
                    variant={billingCycle === cycle ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                  >
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                  </Button>
                ))}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary border border-primary/30 rounded-full px-3 py-1">
                {savingsLabel}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => {
                const Icon = plan.icon;
                const priceValue = plan.price ? plan.price[billingCycle] : null;
                const isCustom = priceValue === null || priceValue === undefined;
                const displayPrice = isCustom
                  ? "Custom"
                  : priceValue === 0
                    ? "$0"
                    : `$${
                        billingCycle === "yearly" ? priceValue / 12 : priceValue
                      }`;
                const priceSuffix = isCustom
                  ? ""
                  : billingCycle === "yearly"
                    ? "/month billed yearly"
                    : "/month";
                const isPopular = Boolean(plan.popular);

                return (
                  <div
                    key={plan.name}
                    onClick={() =>
                      handlePlanSelect(plan, displayPrice, priceSuffix)
                    }
                    className={`relative border bg-linear-to-br ${
                      plan.gradient
                    } rounded-3xl p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 cursor-pointer group select-none ${
                      isPopular
                        ? "border-primary shadow-2xl ring-1 ring-primary/40"
                        : "border-border/60 shadow-lg hover:border-primary/50"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        Most loved
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`${
                          plan.accent ?? ""
                        } bg-background/70 border border-white/10 rounded-2xl h-14 w-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <div className="text-left">
                        {plan.badge && (
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {plan.badge}
                          </p>
                        )}
                        <h3 className="text-2xl font-semibold">{plan.name}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{displayPrice}</span>
                        {!isCustom && (
                          <span className="text-sm text-muted-foreground">
                            {priceSuffix}
                          </span>
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-primary mt-2 font-semibold">
                        {plan.highlight}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-0.5 rounded-full bg-primary/10 p-1">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </span>
                          <p className="text-sm text-foreground/90">{feature}</p>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan, displayPrice, priceSuffix);
                      }}
                      className={`block w-full text-center rounded-2xl py-4 font-semibold transition cursor-pointer ${
                        isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md group-hover:shadow-lg"
                          : "bg-background text-foreground border border-border hover:border-primary/60 group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center mt-8 sm:mt-12 px-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              All plans include SSL encryption, spam protection, and 99.9% uptime
              guarantee. No credit card required for free plan.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
