import { redirect } from "next/navigation";
import { getLinkByShortCode, recordLinkClick } from "@/lib/storage/links";
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
    const link = await getLinkByShortCode(shortCode);

    if (link && link.isActive) {
      await recordLinkClick(shortCode);

      let target = link.originalUrl.trim();
      if (!/^https?:\/\//i.test(target)) {
        target = `https://${target}`;
      }

      targetToRedirect = target;
    }
  } catch (error) {
    console.error("Server lookup error:", error);
  }

  if (targetToRedirect) {
    redirect(targetToRedirect as unknown as Parameters<typeof redirect>[0]);
  }

  return <ClientRedirectFallback shortCode={shortCode} />;
}
