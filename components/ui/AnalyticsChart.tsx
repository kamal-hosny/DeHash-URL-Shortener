"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type?: "bar" | "list";
  total?: number;
}

export default function AnalyticsChart({
  title,
  data,
  type = "bar",
  total,
}: AnalyticsChartProps) {
  const totalValue = useMemo(() => {
    return total || data.reduce((acc, item) => acc + item.value, 0);
  }, [data, total]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-bold">
                  {item.value.toLocaleString()}
                  {type === "bar" && (
                    <span className="text-muted-foreground ml-1 font-normal">
                      ({((item.value / totalValue) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              {type === "bar" && (
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${(item.value / totalValue) * 100}%`,
                      backgroundColor: item.color || "hsl(var(--primary))",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
