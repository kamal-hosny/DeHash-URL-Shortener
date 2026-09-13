"use client";

import { Zap, Shield, BarChart3, Layers, Smartphone, Lock } from "@/assets/icons/index";

export default function Features() {
  const stats = [
    {
      title: "Easy",
      subtitle: "ShortURL is easy and fast, enter the long link to get your shortened link",
      icon: Zap,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      title: "Shortened",
      subtitle: "Use any link, no matter what size, ShortURL always shortens",
      icon: Layers,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      span: "md:col-span-1 md:row-span-2",
    },
    {
      title: "Secure",
      subtitle: "It is fast and secure, our service has HTTPS protocol and data encryption",
      icon: Shield,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      title: "Statistics",
      subtitle: "Check the number of clicks that your shortened URL received",
      icon: BarChart3,
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      title: "Reliable",
      subtitle: "All links that try to disseminate spam, viruses and malware are deleted",
      icon: Lock,
      gradient: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-500",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      title: "Devices",
      subtitle: "Compatible with smartphones, tablets and desktop",
      icon: Smartphone,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
      span: "md:col-span-1 md:row-span-1",
    },
  ];

  return (
    <section className="py-12 sm:py-14 md:py-16 px-4">
      {/* Main Title */}
      <div className="text-center mb-8 sm:mb-10 md:mb-12 space-y-2 sm:space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 px-4">
          Why Choose ShortURL?
        </h1>
        <p className="text-foreground/60 mt-2 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
          A powerful URL shortener designed to make your links simple, secure, and trackable.
        </p>
      </div>

      {/* Bento Grid */}
      <div
        className="
          grid gap-3 sm:gap-4
          grid-cols-1
          md:grid-cols-3
          max-w-6xl mx-auto
        "
      >
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`
                ${item.span}
                group
                relative
                rounded-2xl sm:rounded-3xl
                p-5 sm:p-6 md:p-8
                flex flex-col justify-between
                min-h-[180px] sm:min-h-[200px]
                backdrop-blur-xl
                border border-border/50
                shadow-lg hover:shadow-2xl
                transition-all duration-500 ease-out
                hover:-translate-y-2
                overflow-hidden
                bg-gradient-to-br ${item.gradient}
              `}
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative">
                <div className={`
                  ${item.iconColor}
                  w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                  flex items-center justify-center
                  rounded-xl sm:rounded-2xl
                  bg-background/50
                  backdrop-blur-sm
                  group-hover:scale-110
                  transition-transform duration-500
                  shadow-lg
                  mb-2
                `}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <div className="relative space-y-1.5 sm:space-y-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-foreground/70 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
            </div>
          );
        })}
      </div>
    </section>
  );
}