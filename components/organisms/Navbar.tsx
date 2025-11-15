"use client";


import { useState } from "react";
import ModeToggle from "../atoms/ModeToggle";
import Image from "next/image";
import { logo } from "@/assets";
import Link from "../atoms/link";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

const USER_MENU = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Settings", href: "/settings" },
  { name: "Earnings", href: "/earnings" },
  { name: "Sign out", href: "/logout" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:opacity-80 transition">
                 <Image
                                src={logo}
                                width={20}
                                height={20}
                                alt="Logo"
                                     className=" dark:invert"
                              />
            </div>

            <span className="text-xl font-bold text-foreground">
              DeHash
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Section */}
       {/* */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <Image
                    src="https://i.pinimg.com/736x/5b/26/40/5b26407d7e665b5e521ca260099f58a3.jpg"
                    alt="User"
                    fill
                    className="w-10 h-10 object-cover rounded-full ring-2 ring-border"
                  />
                  <svg
                    className={`w-10 h-10 text-muted-foreground transition-transform ${userOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userOpen && (
                  <div className="absolute top-14 right-0 w-56 bg-background border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-muted border-b border-border">
                      <p className="font-semibold text-foreground">Joseph McFall</p>
                      <p className="text-sm text-muted-foreground truncate">
                        name@flowbite.com
                      </p>
                    </div>

                    <ul className="p-2">
                      {USER_MENU.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-accent rounded-lg transition"
                          >
                            <svg
                              className="w-4 h-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/signin" className="px-5 py-2 text-muted-foreground hover:text-foreground transition">
                  Login
                </Link>

                <a
                  href="/signup"
                  className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>


        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg transition"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {!isAuth && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <a
                  href="/login"
                  className="block px-4 py-2 text-center border border-border text-foreground rounded-lg hover:bg-accent transition"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="block px-4 py-2 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo */}
      <div className="bg-muted border-t border-border p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Demo Mode:</span>
          <button
            onClick={() => setIsAuth(!isAuth)}
            className="px-4 py-1 rounded-full text-sm transition bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {isAuth ? "Logged In ✓" : "Not Logged In"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
