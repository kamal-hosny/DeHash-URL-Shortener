import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { getLinkByShortCode, recordLinkClick } from "@/lib/storage/links";
import {
  parseReferrer,
  parseUserAgent,
  fastGeoFromHeaders,
  resolveGeoLocation,
  ClickMetadata,
} from "@/lib/analytics/tracker";
import ClientRedirectFallback from "./ClientRedirectFallback";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = await params;

  if (!shortCode) {
    return <ClientRedirectFallback shortCode="" />;
  }

  let targetToRedirect: string | null = null;

  try {
    // 1. Ultra-fast lookup from Redis (< 2ms) or DB/Local backup
    const link = await getLinkByShortCode(shortCode);

    if (link && link.isActive) {
      let target = link.originalUrl.trim();
      if (!/^https?:\/\//i.test(target)) {
        target = `https://${target}`;
      }
      targetToRedirect = target;

      // 2. Synchronously capture headers (0ms latency, zero blocking)
      const headerList = await headers();
      const rawIp =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";
      const rawUserAgent = headerList.get("user-agent") || "";
      const rawReferrer = headerList.get("referer") || headerList.get("referrer") || "";

      const { deviceType, browser, os } = parseUserAgent(rawUserAgent);
      const referrer = parseReferrer(rawReferrer);
      const fastGeo = fastGeoFromHeaders(headerList, rawIp);

      // 3. Fire-and-forget background analytics recording via Next.js after()
      // This guarantees redirect is instantaneous (< 10ms) and never blocked by DB or Geo APIs
      const recordTask = async () => {
        try {
          let country = fastGeo.country;
          let city = fastGeo.city;

          if (country === "Unknown") {
            const resolved = await resolveGeoLocation(headerList, rawIp);
            country = resolved.country;
            city = resolved.city;
          }

          const metadata: ClickMetadata = {
            ipAddress: rawIp,
            userAgent: rawUserAgent,
            referrer,
            country,
            city,
            deviceType,
            browser,
            os,
          };

          await recordLinkClick(shortCode, metadata);
        } catch (err) {
          console.error("Background analytics recording error:", err);
        }
      };

      if (typeof after === "function") {
        after(recordTask);
      } else {
        recordTask().catch(() => {});
      }
    }
  } catch (error) {
    console.error("Server redirect error:", error);
  }

  // 4. Instant Redirect
  if (targetToRedirect) {
    redirect(targetToRedirect as unknown as Parameters<typeof redirect>[0]);
  }

  return <ClientRedirectFallback shortCode={shortCode} />;
}
