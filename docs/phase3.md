# Phase 3: User Interface Implementation Guide

## Overview
This phase covers building the complete user interface including authentication pages, user dashboard, link management components, and analytics views.

---

## Step 1: Layout & Global Styles

### 1.1 Root Layout

Create `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "URL Shortener - Shorten Your Links",
  description: "Fast and easy URL shortening service with analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 1.2 Global Styles

Create `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  color: #1f2937;
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
}

input,
textarea {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

## Step 2: Public Pages

### 2.1 Home Page

Create `app/(public)/page.tsx`:
```typescript
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                LinkShort
              </Link>
              <div className="hidden md:flex gap-6 text-gray-600">
                <Link href="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/about" className="hover:text-gray-900">
                  About
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Shorten Your Links Instantly
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create short, memorable links with advanced analytics. Track clicks,
          referrers, and visitor information in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          {!session && (
            <>
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400"
              >
                View Pricing
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Quick Creation",
                description: "Shorten any URL in seconds with our simple interface",
              },
              {
                title: "Analytics",
                description:
                  "Track clicks, locations, devices, and browsers for each link",
              },
              {
                title: "QR Codes",
                description: "Generate QR codes for your shortened links instantly",
              },
              {
                title: "Expiration",
                description: "Set custom expiration dates for your links",
              },
              {
                title: "Pro Plan",
                description: "Upgrade for higher limits and extended features",
              },
              {
                title: "Secure",
                description: "Your data is protected with enterprise-grade security",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-8">Join thousands of users shortening links today</p>
        {!session && (
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Create Your First Link
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 LinkShort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

### 2.2 Pricing Page

Create `app/(public)/pricing/page.tsx`:
```typescript
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  const plans = [
    {
      name: "Free",
      price: "$0",
      links: "50",
      features: [
        "50 links per month",
        "Basic analytics",
        "QR code generation",
        "Link expiration",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "$5",
      links: "1000",
      features: [
        "1000 links per month",
        "Advanced analytics",
        "QR code generation",
        "Link extension",
        "Priority support",
        "API access",
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-4">Simple Pricing</h1>
        <p className="text-gray-600 text-center mb-12">
          Choose the plan that works for you
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? "border-2 border-blue-600 shadow-lg transform scale-105"
                  : "border border-gray-200 bg-gray-50"
              }`}
            >
              {plan.highlighted && (
                <div className="text-blue-600 font-semibold mb-4">MOST POPULAR</div>
              )}
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-4xl font-bold mb-2">
                {plan.price}
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <div className="text-gray-600 mb-6">{plan.links} links per month</div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                {session ? "Choose Plan" : "Get Started"}
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-blue-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2.3 About Page

Create `app/(public)/about/page.tsx`:
```typescript
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">About LinkShort</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            LinkShort is designed to make URL shortening simple, fast, and
            insightful. We believe that analytics should be accessible to
            everyone, not just large enterprises. Our platform makes it easy to
            track your links and understand where your traffic comes from.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
          <ul className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>Simple URL shortening with auto-generated codes</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>Detailed analytics on every link you create</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>QR code generation for easy sharing</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>Flexible pricing for individuals and teams</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-600">
            Have questions? Email us at{" "}
            <a href="mailto:support@linkshort.com" className="text-blue-600">
              support@linkshort.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
```

---

## Step 3: Authentication Pages

### 3.1 Register Page

Create `app/(auth)/register/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/auth/register", { email, password });
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 3.2 Login Page

Create `app/(auth)/login/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## Step 4: Dashboard Components

### 4.1 Link Creation Form

Create `components/molecules/LinkForm.tsx`:
```typescript
"use client";

import { useState } from "react";
import axios from "axios";

interface LinkFormProps {
  onSuccess?: () => void;
}

export default function LinkForm({ onSuccess }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [expiresIn, setExpiresIn] = useState("permanent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortCode, setShortCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShortCode("");
    setLoading(true);

    try {
      const response = await axios.post("/api/links", {
        url,
        expiresIn: expiresIn !== "permanent" ? expiresIn : undefined,
      });

      setShortCode(response.data.shortCode);
      setUrl("");
      setExpiresIn("permanent");
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Link</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {shortCode && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Link created! Short code: <strong>{shortCode}</strong>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL to Shorten
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration
          </label>
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="permanent">Permanent</option>
            <option value="1day">1 Day</option>
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Link"}
        </button>
      </div>
    </form>
  );
}
```

### 4.2 Link List Component

Create `components/molecules/LinkList.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface LinkItem {
  id: number;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

export default function LinkList() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get("/api/links");
      setLinks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      await axios.delete(`/api/links/${id}`);
      setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
      setError("Failed to delete link");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Short Code
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Original URL
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Created
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-mono text-blue-600">
                {link.shortCode}
              </td>
              <td className="px-6 py-4 truncate text-sm">{link.originalUrl}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(link.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 space-x-2">
                <Link
                  href={`/dashboard/link/${link.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {links.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No links created yet
        </div>
      )}
    </div>
  );
}
```

---

## Step 5: Dashboard Pages

### 5.1 Main Dashboard

Create `app/(protected)/dashboard/page.tsx`:
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LinkForm from "@/components/molecules/LinkForm";
import LinkList from "@/components/molecules/LinkList";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-gray-600">{session?.user?.email}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="md:col-span-1">
            <LinkForm onSuccess={() => {}} />
          </div>

          {/* Links Column */}
          <div className="md:col-span-2">
            <LinkList />
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Step 6: Verification Checklist

- [ ] Home page displays correctly
- [ ] Navigation works across all pages
- [ ] Register page creates new accounts
- [ ] Login page authenticates users
- [ ] Dashboard shows after login
- [ ] Link creation form submits successfully
- [ ] Link list displays user's links
- [ ] Delete link functionality works
- [ ] Pricing page displays both plans
- [ ] About page displays correctly
- [ ] Responsive design works on mobile

---

**Status**: Phase 3 Complete - Ready for Phase 4 (Analytics & Admin)
