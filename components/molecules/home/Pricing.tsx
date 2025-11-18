"use client";

import { Check, Zap, Rocket, Crown } from "@/assets/icons/index";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: Zap,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      features: [
        "50 short links per month",
        "Auto-generated short codes",
        "Set link expiration time",
        "View analytics for all links",
        "QR code generation",
        "Duplicate detection (doesn't count quota)",
        "URL validation & security",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$5",
      period: "per month",
      description: "For growing businesses",
      icon: Rocket,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      features: [
        "1,000 short links per month",
        "All Free plan features",
        "Extend expired link validity",
        "Enhanced analytics retention",
        "Priority support",
        "Higher API request limit",
        "Permanent links option",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      icon: Crown,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
      features: [
        "Unlimited short links",
        "All Pro plan features",
        "Custom domain support",
        "White-label solution",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced security features",
        "Custom integrations",
        "Team collaboration tools",
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-accent px-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Choose the perfect plan for your needs. Start free and upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`
                  group relative
                  rounded-2xl sm:rounded-3xl p-6 sm:p-8
                  backdrop-blur-xl
                  border-2 transition-all duration-500
                  hover:-translate-y-2
                  bg-gradient-to-br ${plan.gradient}
                  overflow-hidden
                  ${
                    plan.popular
                      ? "border-primary shadow-2xl scale-[1.02] sm:scale-105 md:scale-110"
                      : "border-border/50 shadow-lg hover:shadow-2xl"
                  }
                `}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative mb-4 sm:mb-6">
                  <div
                    className={`
                      ${plan.iconColor}
                      w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                      flex items-center justify-center
                      rounded-xl sm:rounded-2xl
                      bg-background/50
                      backdrop-blur-sm
                      group-hover:scale-110
                      transition-transform duration-500
                      shadow-lg
                    `}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2} />
                  </div>
                </div>

                {/* Plan Name & Description */}
                <div className="relative mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-sm sm:text-base text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {plan.price === "Custom" && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                      {plan.period}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 relative z-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`
                    w-full py-3 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base
                    transition-all duration-300
                    relative z-10
                    ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }
                  `}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </button>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-16 translate-x-16" />
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 sm:mt-12 px-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            All plans include SSL encryption, spam protection, and 99.9% uptime
            guarantee. No credit card required for free plan.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;