import { UAParser } from "ua-parser-js";
import { redis } from "@/lib/redis/client";

export interface ClickMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  EG: "Egypt",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  IN: "India",
  KW: "Kuwait",
  QA: "Qatar",
  OM: "Oman",
  BH: "Bahrain",
  JO: "Jordan",
  LB: "Lebanon",
  IQ: "Iraq",
  MA: "Morocco",
  DZ: "Algeria",
  TN: "Tunisia",
  LY: "Libya",
  SD: "Sudan",
  TR: "Turkey",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  AU: "Australia",
  BR: "Brazil",
};

/**
 * Normalizes a referrer URL into a human-readable platform or domain name.
 */
export function parseReferrer(rawReferrer?: string | null): string {
  if (!rawReferrer || rawReferrer.trim() === "" || rawReferrer.toLowerCase() === "direct") {
    return "Direct";
  }

  try {
    const url = new URL(rawReferrer);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host.includes("twitter.com") || host.includes("x.com") || host.includes("t.co")) {
      return "Twitter / X";
    }
    if (host.includes("facebook.com") || host.includes("fb.com")) {
      return "Facebook";
    }
    if (host.includes("instagram.com")) {
      return "Instagram";
    }
    if (host.includes("linkedin.com")) {
      return "LinkedIn";
    }
    if (host.includes("whatsapp") || host.includes("wa.me")) {
      return "WhatsApp";
    }
    if (host.includes("telegram") || host.includes("t.me")) {
      return "Telegram";
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "YouTube";
    }
    if (host.includes("google.com")) {
      return "Google";
    }
    if (host.includes("bing.com")) {
      return "Bing";
    }
    if (host.includes("tiktok.com")) {
      return "TikTok";
    }
    if (host.includes("reddit.com")) {
      return "Reddit";
    }

    return host;
  } catch {
    return rawReferrer.slice(0, 50);
  }
}

/**
 * Parses user agent string to identify device, browser, and OS.
 */
export function parseUserAgent(uaString?: string | null) {
  if (!uaString) {
    return {
      deviceType: "Desktop",
      browser: "Unknown",
      os: "Unknown",
    };
  }

  try {
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    let deviceType = "Desktop";
    const rawType = result.device.type?.toLowerCase();
    if (rawType === "mobile") deviceType = "Mobile";
    else if (rawType === "tablet") deviceType = "Tablet";
    else if (/android|iphone|ipod/i.test(uaString)) deviceType = "Mobile";
    else if (/ipad/i.test(uaString)) deviceType = "Tablet";

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";

    return { deviceType, browser, os };
  } catch {
    return {
      deviceType: "Desktop",
      browser: "Unknown",
      os: "Unknown",
    };
  }
}

/**
 * Synchronously and instantly extracts country and city from CDN headers (0ms latency).
 */
export function fastGeoFromHeaders(
  headers: { get: (name: string) => string | null },
  ipAddress: string
): { country: string; city: string } {
  // 1. Check CDN Geolocation headers (Cloudflare, Vercel)
  const headerCountryCode =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code");

  const headerCity =
    headers.get("cf-ipcity") ||
    headers.get("x-vercel-ip-city") ||
    headers.get("x-city");

  if (headerCountryCode && headerCountryCode !== "XX") {
    const code = headerCountryCode.toUpperCase();
    const country = COUNTRY_NAMES[code] || code;
    return {
      country,
      city: headerCity || "Unknown",
    };
  }

  // 2. Check for local/private IP addresses
  const isPrivate =
    !ipAddress ||
    ipAddress === "127.0.0.1" ||
    ipAddress === "::1" ||
    ipAddress === "localhost" ||
    ipAddress.startsWith("192.168.") ||
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("172.16.");

  if (isPrivate) {
    return {
      country: "Local / Development",
      city: "Localhost",
    };
  }

  return { country: "Unknown", city: "Unknown" };
}

/**
 * Resolves country and city from request headers or IP (with Redis caching and background lookup).
 */
export async function resolveGeoLocation(
  headers: { get: (name: string) => string | null },
  ipAddress: string
): Promise<{ country: string; city: string }> {
  // 1. Try fast resolution from CDN headers or private IP
  const fast = fastGeoFromHeaders(headers, ipAddress);
  if (fast.country !== "Unknown") {
    return fast;
  }

  // 2. Optional lookup for public IP with Redis cache
  const cacheKey = `geo:${ipAddress}`;
  try {
    const cached = await redis.get<{ country: string; city: string } | string>(cacheKey);
    if (cached) {
      if (typeof cached === "string") return JSON.parse(cached);
      return cached;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600); // 600ms max timeout

    const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        const geo = {
          country: data.country || "Unknown",
          city: data.city || "Unknown",
        };
        await redis.set(cacheKey, JSON.stringify(geo), { ex: 60 * 60 * 24 * 30 }); // cache 30 days
        return geo;
      }
    }
  } catch {
    // Ignore geo lookup timeouts gracefully
  }

  return { country: "Unknown", city: "Unknown" };
}


