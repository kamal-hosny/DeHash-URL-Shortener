"use client";

import Iridescence from "@/components/animation/Iridescence";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen bg-background overflow-hidden">

      {/* 🔥 BACKGROUND ANIMATION */}
      <div className="absolute inset-0 z-0">
         <Iridescence
                   color={[0.1, 0.45, 0.9]}
                   mouseReact={false}
                   amplitude={0.18}
                   speed={0.85}
                 />
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex-1 h-full">
        {children}
      </div>
    </div>
  );
}
