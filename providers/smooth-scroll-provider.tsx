"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lenis: Lenis | null = null;
    let rafId: number;

    const timeoutId = setTimeout(() => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        if (lenis) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}

