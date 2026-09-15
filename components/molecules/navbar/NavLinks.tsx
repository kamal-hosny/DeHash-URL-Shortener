"use client";

import { usePathname } from "next/navigation";
import Link from "../../ui/Link";

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-150 ${
              isActive
                ? "bg-accent/60 text-foreground shadow-2xs font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
};
