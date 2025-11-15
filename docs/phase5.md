# Phase 5: Polish & Deployment Implementation Guide

## Overview
This phase covers finalizing the application with QR code generation, error handling, validation, testing, Docker setup, and deployment configurations.

---

## Step 1: QR Code Generation

### 1.1 QR Code Component

Create `components/molecules/QRCodeGenerator.tsx`:
```typescript
"use client";

import { useState } from "react";
import QRCode from "qrcode.react";

interface QRCodeGeneratorProps {
  shortCode: string;
  originalUrl: string;
}

export default function QRCodeGenerator({
  shortCode,
  originalUrl,
}: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);
  const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${shortCode}`;

  const downloadQRCode = () => {
    const canvas = document.querySelector(
      'canvas[role="img"]'
    ) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qr-${shortCode}.png`;
      link.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">QR Code</h3>

      <button
        onClick={() => setShowQR(!showQR)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
      >
        {showQR ? "Hide" : "Show"} QR Code
      </button>

      {showQR && (
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border-2 border-gray-200 rounded">
            <QRCode
              value={qrUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scan to open: {originalUrl}
          </p>
          <button
            onClick={downloadQRCode}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
```

### 1.2 Add QR Code to Link Details

Update `app/(protected)/dashboard/link/[id]/page.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import AnalyticsChart from "@/components/molecules/AnalyticsChart";
import QRCodeGenerator from "@/components/molecules/QRCodeGenerator";
import Link from "next/link";

export default function LinkAnalyticsPage() {
  const params = useParams();
  const linkId = params.id as string;
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLink();
  }, [linkId]);

  const fetchLink = async () => {
    try {
      const response = await axios.get(`/api/links/${linkId}`);
      setLink(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load link");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-2">Link Analytics</h1>
          <p className="text-gray-600">Short Code: {link?.shortCode}</p>
        </div>
      </header>

      {/* Link Info */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Original URL</div>
                <a
                  href={link?.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate text-sm"
                >
                  {link?.originalUrl}
                </a>
              </div>
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Short Link</div>
                <code className="text-sm bg-gray-100 p-2 rounded block break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/r/${link?.shortCode}`
                    : "Loading..."}
                </code>
              </div>
              {link?.expiresAt && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Expires</div>
                  <span className="text-sm">
                    {new Date(link.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <QRCodeGenerator
              shortCode={link?.shortCode}
              originalUrl={link?.originalUrl}
            />
          </div>

          {/* Analytics */}
          <div className="md:col-span-2">
            <AnalyticsChart linkId={parseInt(linkId)} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Step 2: Error Handling & Validation

### 2.1 Error Boundary Component

Create `components/atoms/ErrorBoundary.tsx`:
```typescript
"use client";

import { ReactNode, useState, useEffect } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold mb-2">Something went wrong</h2>
          <p className="text-sm">{error?.message}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
```

### 2.2 Enhanced Form Validation

Create `lib/validators/form-validator.ts`:
```typescript
import { z } from "zod";

export const urlSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => !url.includes("localhost") && !url.includes("127.0.0.1"),
      "Localhost URLs are not allowed"
    ),
  expiresIn: z
    .enum(["permanent", "1day", "7days", "30days"])
    .optional()
    .default("permanent"),
});

export const registrationSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateLinkSchema = z.object({
  expiresAt: z.string().datetime().optional(),
});

export type UrlInput = z.infer<typeof urlSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
```

### 2.3 API Error Handler

Create `lib/api/error-handler.ts`:
```typescript
import { NextResponse } from "next/server";

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiException) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function throwApiError(
  status: number,
  message: string,
  details?: Record<string, any>
): never {
  throw new ApiException(status, message, details);
}
```

---

## Step 3: Testing Setup

### 3.1 Jest Configuration

Create `jest.config.js`:
```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 3.2 Jest Setup

Create `jest.setup.js`:
```javascript
import "@testing-library/jest-dom";

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

### 3.3 Utility Tests

Create `__tests__/lib/utils.test.ts`:
```typescript
import {
  generateShortCode,
  hashUrl,
  isValidUrl,
  getCurrentMonth,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("generateShortCode", () => {
    it("should generate a short code of correct length", () => {
      const code = generateShortCode(8);
      expect(code).toHaveLength(8);
    });

    it("should contain only alphanumeric characters", () => {
      const code = generateShortCode();
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it("should generate different codes each time", () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe("hashUrl", () => {
    it("should return a consistent hash for the same URL", () => {
      const url = "https://example.com";
      const hash1 = hashUrl(url);
      const hash2 = hashUrl(url);
      expect(hash1).toBe(hash2);
    });

    it("should return different hashes for different URLs", () => {
      const hash1 = hashUrl("https://example.com");
      const hash2 = hashUrl("https://different.com");
      expect(hash1).not.toBe(hash2);
    });

    it("should return a 64-character hex string", () => {
      const hash = hashUrl("https://example.com");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("isValidUrl", () => {
    it("should accept valid HTTP URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
    });

    it("should accept valid HTTPS URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
    });

    it("should reject localhost URLs", () => {
      expect(isValidUrl("http://localhost:3000")).toBe(false);
    });

    it("should reject 127.0.0.1 URLs", () => {
      expect(isValidUrl("http://127.0.0.1:3000")).toBe(false);
    });

    it("should reject invalid URL formats", () => {
      expect(isValidUrl("not a url")).toBe(false);
    });
  });

  describe("getCurrentMonth", () => {
    it("should return YYYY-MM format", () => {
      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should return current month", () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      expect(getCurrentMonth()).toBe(expected);
    });
  });
});
```

---

## Step 4: Docker Setup

### 4.1 Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["npm", "start"]
```

### 4.2 Docker Compose

Create `docker-compose.yml`:
```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: url-shortener
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      REDIS_TOKEN: ${REDIS_TOKEN}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

volumes:
  app_data:
    driver: local
```

### 4.3 .dockerignore

Create `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.*.local
.next
out
.DS_Store
dist
build
coverage
__tests__
.jest
.eslintcache
```

---

## Step 5: Environment Configuration

### 5.1 Production .env.example

Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis
REDIS_URL=redis://default:password@host:port
REDIS_TOKEN=your-token

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Optional Email Service
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Environment
NODE_ENV=production
```

### 5.2 Build Configuration Update

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    strictNullChecks: true,
  },
  eslint: {
    dirs: ["app", "lib", "components"],
  },
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
```

---

## Step 6: Deployment Guide

### 6.1 Vercel Deployment

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "REDIS_URL": "@redis_url",
    "REDIS_TOKEN": "@redis_token",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url",
    "NODE_ENV": "production"
  },
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

### 6.2 Deployment Steps

#### For Vercel:

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub

2. **Configure Environment Variables**
   - Set all `.env` variables in Vercel dashboard
   - Test database connection

3. **Deploy**
   - Click Deploy
   - Monitor build logs

#### For Railway/Render:

1. **Connect Repository**
   - Link GitHub repo
   - Select main branch

2. **Configure Build**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Add all required .env variables

4. **Deploy and Monitor**

#### For Docker (Self-Hosted):

1. **Build Docker Image**
   ```bash
   docker build -t url-shortener:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name url-shortener \
     -p 3000:3000 \
     --env-file .env.production \
     url-shortener:latest
   ```

3. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

## Step 7: Monitoring & Logging

### 7.1 Logging Setup

Create `lib/logger.ts`:
```typescript
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

function formatLog(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };

  return JSON.stringify(logEntry);
}

export const logger = {
  error: (message: string, data?: any) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },
  warn: (message: string, data?: any) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },
  info: (message: string, data?: any) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
};
```

### 7.2 Performance Monitoring

Create `middleware/performance.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export function performanceMiddleware(request: NextRequest) {
  const start = performance.now();

  const response = NextResponse.next();

  const end = performance.now();
  const duration = end - start;

  response.headers.set("X-Response-Time", `${duration.toFixed(2)}ms`);

  if (duration > 1000) {
    console.warn(
      `Slow request: ${request.nextUrl.pathname} took ${duration.toFixed(2)}ms`
    );
  }

  return response;
}
```

---

## Step 8: Package.json Scripts

Update `package.json` with additional scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:push": "drizzle-kit push:postgres",
    "db:generate": "drizzle-kit generate:postgres",
    "db:migrate": "drizzle-kit migrate",
    "docker:build": "docker build -t url-shortener:latest .",
    "docker:run": "docker-compose up -d",
    "docker:stop": "docker-compose down"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "prettier": "^3.1.1"
  }
}
```

---

## Step 9: Verification Checklist

- [ ] QR code generation working
- [ ] Error boundary catching errors
- [ ] Form validation working correctly
- [ ] API error handler returning proper responses
- [ ] Unit tests passing
- [ ] Docker image builds successfully
- [ ] Docker container runs without errors
- [ ] Environment variables properly configured
- [ ] Logging capturing important events
- [ ] Performance monitoring active
- [ ] Deployment configuration correct
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Redis connections working
- [ ] Authentication functioning

---

## Step 10: Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] ESLint checks passing
- [ ] Environment variables set
- [ ] Database backups created
- [ ] Redis backup configured
- [ ] SSL certificate ready (for HTTPS)
- [ ] Domain DNS configured
- [ ] Monitoring setup complete
- [ ] Logging service configured
- [ ] Error tracking service ready
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] Rate limiting properly set

---

## Step 11: Post-Deployment

### 11.1 Health Checks
```bash
# Check application health
curl https://yourdomain.com/health

# Check database connection
curl https://yourdomain.com/api/health/db

# Check Redis connection
curl https://yourdomain.com/api/health/redis
```

### 11.2 Monitoring
- Set up error tracking (Sentry, Rollbar)
- Configure log aggregation (DataDog, New Relic)
- Set up performance monitoring
- Configure uptime monitoring
- Set up alerts for critical events

### 11.3 Backup Strategy
- Daily database backups
- Weekly full backups
- Test restore procedures monthly
- Keep 30 days of backups

---

## Key Features Implemented

✅ **QR Code Generation**: Generate and download QR codes for links  
✅ **Error Handling**: Comprehensive error boundary and handlers  
✅ **Form Validation**: Robust client-side and server-side validation  
✅ **Testing**: Unit tests with Jest and React Testing Library  
✅ **Docker**: Containerized application for easy deployment  
✅ **Monitoring**: Logging and performance tracking  
✅ **Deployment**: Multiple deployment options (Vercel, Railway, Docker)  
✅ **Security**: Environment-based configuration  
✅ **Performance**: Optimized builds and response times  
✅ **Health Checks**: Container and service health monitoring  

---

## Deployment Summary

| Platform | Difficulty | Time | Cost |
|----------|------------|------|------|
| **Vercel** | Easy | 5 min | Free tier available |
| **Railway** | Easy | 10 min | Free tier available |
| **Docker (Self-hosted)** | Medium | 30 min | Varies |
| **AWS/GCP/Azure** | Hard | 1-2 hours | Varies |

---

**Status**: Phase 5 Complete - Application Ready for Production

### Next Steps After Deployment:
1. Monitor application performance
2. Gather user feedback
3. Plan Phase 6 (Enhancements & Scaling)
4. Consider payment integration
5. Add advanced analytics
