"use client";

import { logo } from "@/assets";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-muted py-10 border-t">
      <div className="container">
        {/* Top Section */}
        <div className="md:flex md:justify-between md:items-start">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                width={32}
                height={32}
                alt="Logo"
                className="dark:invert"
              />
              <span className="text-2xl font-semibold text-foreground">
                DeHash
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-12 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">
                Resources
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Components
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">
                Follow Us
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Github
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Discord
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">
                Legal
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Bottom Section */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            © 2025 DeHash. All Rights Reserved.
          </span>

          {/* Social Icons */}
          <div className="flex items-center gap-5 mt-4 sm:mt-0 text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.135 6H15V3h-1.865a4.147..." />
              </svg>
            </Link>

            <Link href="#" className="hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.942 5.556a16.3..." />
              </svg>
            </Link>

            <Link href="#" className="hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.795 10.533 20.68 2..." />
              </svg>
            </Link>

            <Link href="#" className="hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.006 2a9.847..." />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
