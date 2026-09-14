export const siteConfig = {
  name: "DeHash",
  shortName: "DeHash",
  tagline: "Modern URL Shortener & Dynamic QR Code Generator",
  description:
    "Shorten links, generate customized QR codes, track in-depth visitor analytics, and set link expirations with DeHash. The fast, secure, and developer-friendly link management platform.",
  url: (
    process.env.NEXT_PUBLIC_APP_URL || "https://de-hash-url-shortener.vercel.app"
  ).replace(/\/+$/, ""),
  ogImage: "/opengraph-image",
  links: {
    twitter: "https://x.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  creator: "DeHash",
  publisher: "DeHash",
  keywords: [
    // English Keywords
    "URL shortener",
    "link shortener",
    "custom short URLs",
    "QR code generator",
    "dynamic QR codes",
    "link analytics",
    "click tracking",
    "link management platform",
    "short links with analytics",
    "URL redirect",
    "free URL shortener",
    "expired link recovery",
    "branded short links",
    "secure link shortener",
    "DeHash",
    // Arabic Keywords
    "اختصار الروابط",
    "تقصير الروابط",
    "صانع باركود",
    "توليد كود QR",
    "تحليل الروابط والنقرات",
    "روابط قصيرة مجانية",
  ],
  locale: "en_US",
};

export type SiteConfig = typeof siteConfig;
