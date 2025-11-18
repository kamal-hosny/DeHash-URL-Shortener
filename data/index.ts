export const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      content: "The analytics dashboard is exactly what I needed. I can see click counts, geographic data, device types, and referrer information for all my links. The duplicate detection feature saves me from wasting my monthly quota. Perfect for tracking our marketing campaigns.",
      rating: 5,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      name: "Michael Chen",
      role: "Content Creator",
      company: "Digital Media",
      content: "As a content creator, I love that duplicate URLs don't count toward my quota. The QR code generation is seamless and the link expiration feature helps me manage temporary campaigns. The 50 links per month on the free plan is perfect for getting started.",
      rating: 5,
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      name: "Emily Rodriguez",
      role: "E-commerce Manager",
      company: "ShopSmart",
      content: "Upgraded to Pro for the 1,000 links per month and the ability to extend expired links. The analytics show me exactly where my traffic comes from - country, city, device, browser. This data has been invaluable for understanding our customer behavior.",
      rating: 5,
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
  ];

export const faqs = [
    {
      question: "Do I need to create an account to use the service?",
      answer:
        "Yes, authentication is required. All users must register and login to create and manage short links. This ensures secure access to your links and analytics data. We use NextAuth v4 with secure password hashing for your protection.",
    },
    {
      question: "How many links can I create per month?",
      answer:
        "Free plan users can create 50 short links per month, while Pro plan users get 1,000 links per month. Your monthly quota resets on the 1st of each month. Duplicate URLs (same URL shortened again) don't count toward your quota - you'll get the existing short code instead.",
    },
    {
      question: "Can I create custom short codes?",
      answer:
        "No, custom slugs are not available in the MVP version. All short codes are auto-generated to ensure uniqueness and prevent conflicts. This feature may be added in future updates.",
    },
    {
      question: "What happens when a link expires?",
      answer:
        "Expired links show a dedicated expiration page when accessed. Free plan users can set expiration times for their links. Pro plan users have an additional feature: they can extend the validity of expired links, bringing them back to active status.",
    },
    {
      question: "What analytics data do you track?",
      answer:
        "We track comprehensive analytics for each link click: click count, referrer information, geographic location (country and city), device type (Mobile/Desktop/Tablet), browser information, and timestamp of each click. All analytics are available for your own links in your dashboard.",
    },
    {
      question: "How does duplicate detection work?",
      answer:
        "If you shorten the same URL again, our system detects the duplicate and returns your existing short code instead of creating a new one. This doesn't count toward your monthly quota. However, if a different user shortens the same URL, they'll get their own unique short code.",
    },
    {
      question: "What URLs are blocked or validated?",
      answer:
        "We validate all URLs before shortening. We block localhost URLs, malicious websites, and adult content to ensure a safe experience for all users. All links are scanned for security threats before being created.",
    },
    {
      question: "Can I extend expired links?",
      answer:
        "Yes, but this is a Pro plan feature only. If you're on the Pro plan and a link has expired, you can extend its validity to make it active again. Free plan users cannot extend expired links.",
    },
    {
      question: "What happens to my links if I exceed my monthly quota?",
      answer:
        "If you exceed your monthly limit, new link creation will be restricted until your quota resets on the 1st of the next month. Your existing links remain active and accessible. You can upgrade to Pro plan for 1,000 links per month if you need more capacity.",
    },
    {
      question: "Do you offer QR codes?",
      answer:
        "Yes! All plans include QR code generation for your shortened links. You can generate, view, and download QR codes for any of your links directly from your dashboard. This is perfect for print materials, business cards, or offline marketing campaigns.",
    },
  ];