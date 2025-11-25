"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  variant?: "default" | "glass";
}

export default function BackButton({ variant = "default" }: BackButtonProps) {
  const router = useRouter();
  const isGlass = variant === "glass";

  return (
    <Button
      variant={isGlass ? "ghost" : "outline"}
      onClick={() => router.push("/")}
      className={cn(
        "flex items-center gap-2 text-base font-medium transition-all duration-300 group",
        isGlass
          ? `
            relative overflow-hidden
            bg-background/20 backdrop-blur-md
            border border-border/40
            text-foreground/90 
            shadow-[0_4px_20px_rgba(0,0,0,0.15)]
            hover:bg-background/30 hover:text-foreground
            hover:border-border/60
            hover:shadow-[0_6px_24px_rgba(0,0,0,0.25)]
            active:scale-[0.98]
          `
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="transition-transform group-hover:-translate-x-1"
      >
        <path d="M19 12H5M5 12L12 19M5 12L12 5" />
      </svg>

      Back
    </Button>
  );
}
