"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type?: "bar" | "list";
  total?: number;
  className?: string;
}

// Helper to get corresponding country flag, platform, device or browser icon
function getLabelIcon(label: string): string {
  const l = label.toLowerCase().trim();

  // Countries / Locations
  if (l.includes("egypt")) return "🇪🇬";
  if (l.includes("saudi")) return "🇸🇦";
  if (l.includes("emirates") || l.includes("uae")) return "🇦🇪";
  if (l.includes("united states") || l.includes("usa") || l.includes("us")) return "🇺🇸";
  if (l.includes("united kingdom") || l.includes("uk") || l.includes("britain")) return "🇬🇧";
  if (l.includes("germany")) return "🇩🇪";
  if (l.includes("france")) return "🇫🇷";
  if (l.includes("canada")) return "🇨🇦";
  if (l.includes("india")) return "🇮🇳";
  if (l.includes("kuwait")) return "🇰🇼";
  if (l.includes("qatar")) return "🇶🇦";
  if (l.includes("oman")) return "🇴🇲";
  if (l.includes("bahrain")) return "🇧🇭";
  if (l.includes("jordan")) return "🇯🇴";
  if (l.includes("morocco")) return "🇲🇦";
  if (l.includes("algeria")) return "🇩🇿";
  if (l.includes("tunisia")) return "🇹🇳";
  if (l.includes("turkey")) return "🇹🇷";
  if (l.includes("netherlands")) return "🇳🇱";
  if (l.includes("spain")) return "🇪🇸";
  if (l.includes("italy")) return "🇮🇹";
  if (l.includes("brazil")) return "🇧🇷";
  if (l.includes("australia")) return "🇦🇺";
  if (l.includes("local") || l.includes("dev") || l.includes("localhost")) return "💻";

  // Devices
  if (l.includes("desktop") || l.includes("windows") || l.includes("mac")) return "🖥️";
  if (l.includes("mobile") || l.includes("android") || l.includes("iphone")) return "📱";
  if (l.includes("tablet") || l.includes("ipad")) return "📟";

  // Browsers
  if (l.includes("chrome")) return "🟡";
  if (l.includes("safari")) return "🧭";
  if (l.includes("firefox")) return "🦊";
  if (l.includes("edge")) return "🔷";
  if (l.includes("opera")) return "⭕";

  // Platforms / Referrers
  if (l.includes("twitter") || l.includes("x.com") || l.includes("t.co")) return "𝕏";
  if (l.includes("facebook") || l.includes("fb.com")) return "📘";
  if (l.includes("whatsapp")) return "💬";
  if (l.includes("instagram")) return "📷";
  if (l.includes("linkedin")) return "💼";
  if (l.includes("youtube")) return "▶️";
  if (l.includes("google")) return "🔍";
  if (l.includes("bing")) return "🌐";
  if (l.includes("tiktok")) return "🎵";
  if (l.includes("reddit")) return "🤖";
  if (l.includes("direct")) return "🔗";

  return "🌐";
}

export default function AnalyticsChart({
  title,
  subtitle,
  data,
  type = "bar",
  total,
  className = "",
}: AnalyticsChartProps) {
  const totalValue = useMemo(() => {
    return total || data.reduce((acc, item) => acc + item.value, 0);
  }, [data, total]);

  const activeData = useMemo(() => {
    return data.filter((d) => d.value > 0);
  }, [data]);

  return (
    <Card className={`border border-border/80 shadow-sm flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground tracking-tight">
            {title}
          </CardTitle>
          {totalValue > 0 && (
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {totalValue.toLocaleString()} clicks
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="pt-1 flex-1">
        {activeData.length > 0 ? (
          <div className="space-y-3.5">
            {activeData.map((item, index) => {
              const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
              const icon = getLabelIcon(item.label);

              return (
                <div
                  key={index}
                  className="space-y-1.5 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-base flex-shrink-0 leading-none">
                        {icon}
                      </span>
                      <span className="font-medium text-foreground truncate text-xs sm:text-sm">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-foreground text-xs sm:text-sm">
                        {item.value.toLocaleString()}
                      </span>
                      {type === "bar" && (
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {percent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {type === "bar" && (
                    <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, Math.max(percent, 2))}%`,
                          backgroundColor:
                            item.color || "hsl(var(--primary))",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-1.5">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium">No visitor data yet</p>
            <p className="text-xs text-muted-foreground/80">
              Share your link to see live breakdown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
