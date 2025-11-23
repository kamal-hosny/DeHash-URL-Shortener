"use client";

import { FooterLogo } from "../molecules/footer/FooterLogo";
import { FooterLinks } from "../molecules/footer/FooterLinks";
import { SocialLinks } from "../molecules/footer/SocialLinks";
import { Copyright } from "../molecules/footer/Copyright";

const Footer = () => {
  return (
    <footer className="relative bg-muted/40 backdrop-blur-lg border-t border-border py-14">
      <div className="container space-y-12">
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          {/* Brand + Description */}
          <FooterLogo />

          {/* Footer Links */}
          <FooterLinks />
        </div>

        <div className="border-t border-border pt-6"></div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <Copyright />

          {/* Social */}
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
