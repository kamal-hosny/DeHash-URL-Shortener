"use client";

import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Dribbble,
} from "lucide-react";
import Image from "next/image";
import { logo } from "@/assets";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { label: "Github", href: "https://github.com", icon: Github },
  { label: "Twitter", href: "https://x.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Dribbble", href: "https://dribbble.com", icon: Dribbble },
];

const Footer = () => {
  return (
    <footer className="relative bg-muted/40 backdrop-blur-lg border-t border-border py-14">
      <div className="container space-y-12">
        
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          
          {/* Brand + Description */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                width={40}
                height={40}
                alt="Logo"
                className="dark:invert"
              />
              <span className="text-3xl font-bold tracking-tight text-foreground">
                DeHash
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              DeHash turns long, messy URLs into elegant short links backed by
              realtime analytics, smart monitoring and enterprise-grade security.
            </p>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="mb-4 text-xs font-semibold text-foreground tracking-wider uppercase">
                  {section.title}
                </h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6"></div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Copyright */}
          <div className="space-y-0.5">
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DeHash — All rights reserved.
            </span>
            <span className="text-sm text-muted-foreground/90 italic flex items-center gap-2">
              by Kamal Hosny
            </span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border 
                hover:border-primary hover:text-primary 
                transition-all hover:shadow-sm"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
