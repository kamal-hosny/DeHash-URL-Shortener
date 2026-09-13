"use client";

import React, { useEffect, useState } from "react";
import { useLinkStore, Link as LinkType } from "@/store/linkStore";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  shortCode: string;
}

export default function ClientRedirectFallback({ shortCode }: Props) {
  const { links, incrementClicks } = useLinkStore();
  const [status, setStatus] = useState<"checking" | "redirecting" | "not_found" | "inactive">(
    "checking"
  );
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(() => {
      if (isCancelled) return;

      let matchedLink: LinkType | undefined = links.find(
        (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
      );

      // Fallback to localStorage directly if not found in current state
      if (!matchedLink && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("dehash-links-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
            const localLinks: LinkType[] = parsed?.state?.links || [];
            matchedLink = localLinks.find(
              (l) => l.shortCode?.toLowerCase() === shortCode.toLowerCase()
            );
          }
        } catch (e) {
          console.error("Error reading localStorage:", e);
        }
      }

      if (!matchedLink) {
        setStatus("not_found");
        return;
      }

      if (!matchedLink.isActive) {
        setStatus("inactive");
        return;
      }

      let url = matchedLink.originalUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      setTargetUrl(url);
      setStatus("redirecting");

      if (incrementClicks) {
        incrementClicks(shortCode);
      }

      // Sync to server in background
      fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchedLink),
      }).catch((e) => console.error("Sync error:", e));

      window.location.replace(url);
    });

    return () => {
      isCancelled = true;
    };
  }, [shortCode, links, incrementClicks]);

  if (status === "checking" || status === "redirecting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">
            Redirecting to destination...
          </h2>
          <p className="text-sm text-muted-foreground">
            Please hold on while we transfer you to your target page.
          </p>
          {targetUrl && (
            <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto font-mono">
              {targetUrl}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "inactive") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-5 max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Link Inactive or Expired
          </h1>
          <p className="text-muted-foreground text-sm">
            This short link <span className="font-mono text-foreground font-semibold">/{shortCode}</span> has been disabled or has reached its expiration date.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/dashboard/links"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-5 max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">
          Link Not Found
        </h1>
        <p className="text-muted-foreground text-sm">
          We could not find the link for <span className="font-mono text-foreground font-semibold">/{shortCode}</span>. It may have been removed or the short code is incorrect.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/dashboard/links"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
