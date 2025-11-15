# URL Shortener MVP - Complete Project Plan

## Project Overview

A comprehensive URL shortening service with authentication, rate limiting, analytics, and admin management. Built with modern tech stack: Next.js 16, React 19, Drizzle ORM, NextAuth, Upstash Redis, and TanStack React Query.

---

## 1. Authentication & Authorization

### Requirements
- **Login Required**: All users must register and login to use the platform
- **User Roles**: 
  - **Regular Users**: Can create and manage their own links
  - **Admin Users**: Can view all users, links, activity logs, and subscription plans

### Authentication Flow
- Email/Password based authentication using **NextAuth v4**
- Password hashing with **bcrypt**
- Session-based authentication
- Protected routes middleware

---

## 2. Subscription Plans

### Free Plan
- **Price**: Free
- **Links per Month**: 50
- **API Request Limit**: Limited
- **Features**:
  - Create short links with auto-generated codes
  - Set link expiration time
  - View analytics for links
  - QR code generation

### Pro Plan
- **Price**: $5/month
- **Links per Month**: 1000
- **API Request Limit**: Higher limit
- **Features**:
  - All Free plan features
  - Extend expired link validity
  - Enhanced analytics retention
  - Priority support

---

## 3. Short Link Behavior

### Link Creation
- **Auto-Generated Short Codes**: No custom slugs for MVP
- **URL Validation**: Check against:
  - Localhost URLs
  - Malicious websites
  - Adult content
- **Deduplication**: 
  - Same URL by same user → Returns existing short code
  - Duplicate requests do NOT count toward monthly quota
  - Different user → Gets different short code
- **Expiration Options**:
  - Permanent (no expiration)
  - Custom duration (user-defined)

### Link Expiration Handling
- **Expired Link Page**: Dedicated page showing link has expired
- **Pro Feature**: Users on Pro plan can extend link validity
- **Soft Delete**: Expired links marked as inactive (kept for analytics)

---

## 4. Rate Limiting & Quota Management

### Rate Limiting Strategy
- **Tracked Per User**: Monthly quota based on subscription plan
- **Counts All Requests**: 
  - Web UI actions
  - API calls
  - Server Actions (Next.js)
  - Any backend request counts toward limit
- **Storage**: Upstash Redis for fast tracking
- **Reset**: Monthly quota resets on the 1st of each month

### Quota Rules
- Free: 50 links/month
- Pro: 1000 links/month
- Duplicates do NOT count toward quota
- Rate limiting applies to all operations (CRUD, analytics)

---

## 5. User Dashboard Features

### Link Management
- **View All Links**: List all created links with status
- **Create Link**: Form to shorten URLs with expiration options
- **Edit Link**: Modify expiration time or other settings
- **Delete Link**: Remove links (soft or hard delete)
- **Quick Actions**: Copy to clipboard, QR code, share

### Analytics
- **Per-Link Analytics**:
  - Click count
  - Referrer information
  - Geographic location (Country/City)
  - Device type (Mobile/Desktop/Tablet)
  - Browser information
  - Timestamp of each click
- **Analytics Availability**: Always available for user's own links

### QR Code Generation
- Generate QR codes for each short link
- Download QR code as image
- Display QR code in link details

---

## 6. Admin Dashboard Features

### User Management
- **View All Users**: List of all registered users
- **User Information**:
  - Email
  - Subscription plan (Free/Pro)
  - Account creation date
  - Last activity timestamp
  - Total links created

### Activity Monitoring
- **User Activity Logs**: Track all user actions
  - Link creation
  - Link modification
  - Link deletion
  - Link access/clicks
- **Audit Logs**: 
  - Who did what
  - When it happened
  - What was changed

### Admin Capabilities
- View comprehensive analytics across all users
- Monitor system usage and quotas
- Identify potential abuse
- (Future) Manage user accounts and subscriptions

---

## 7. Public Pages (No Authentication Required)

### Home Page (`/`)
- Hero section with value proposition
- Features overview
- Call-to-action buttons (Sign Up, Login)
- Pricing preview/link
- Recent statistics (optional)

### Pricing Page (`/pricing`)
- Clear comparison of Free vs Pro plans
- Feature comparison table
- Monthly limits displayed
- Call-to-action buttons to upgrade
- FAQ section (optional)

### About Us Page (`/about`)
- Project/Company information
- Mission statement
- Team information (optional)
- Contact information

---

## 8. Database Schema

### Users Table
```
- id (PK)
- email (unique)
- password (hashed with bcrypt)
- subscription_plan (FREE/PRO)
- created_at
- last_activity
- is_admin (boolean)
```

### SubscriptionPlans Table
```
- id (PK)
- name (FREE/PRO)
- links_per_month (50/1000)
- price (0/$5)
```

### ShortLinks Table
```
- id (PK)
- user_id (FK → Users)
- original_url
- original_url_hash (SHA256 for deduplication)
- short_code (unique)
- expires_at (nullable for permanent)
- created_at
- updated_at
- is_active (boolean, soft delete)
- UNIQUE(user_id, original_url_hash)
```

### LinkAnalytics Table
```
- id (PK)
- link_id (FK → ShortLinks)
- clicked_at
- referrer
- country
- city
- device_type (Mobile/Desktop/Tablet)
- browser
- ip_address
- user_agent
```

### AuditLogs Table
```
- id (PK)
- user_id (FK → Users)
- action (CREATE_LINK, UPDATE_LINK, DELETE_LINK, etc.)
- details (JSON)
- timestamp
- ip_address
```

### UserMonthlyUsage Table
```
- id (PK)
- user_id (FK → Users)
- month (YYYY-MM format)
- links_created (counter)
- api_requests (counter)
- UNIQUE(user_id, month)
```

---

## 9. API Routes Overview

### Public Routes (No Auth Required)
```
GET /r/:shortCode                          # Redirect to original URL + track analytics
GET /expired/:shortCode                    # Show expired link page
```

### Authentication Routes
```
POST /api/auth/register                    # User registration
POST /api/auth/login                       # User login
POST /api/auth/logout                      # User logout
```

### User Links API (Protected)
```
POST /api/links                            # Create short link (checks dedup, quota)
GET /api/links                             # List user's links
GET /api/links/:id                         # Get link details
PUT /api/links/:id                         # Update link (expiration, etc.)
DELETE /api/links/:id                      # Delete link
GET /api/links/:id/analytics               # Get link analytics
POST /api/links/:id/extend                 # Extend expiration (Pro only)
POST /api/links/validate                   # Validate URL before shortening
```

### Admin API (Protected - Admin Only)
```
GET /api/admin/users                       # List all users with pagination
GET /api/admin/users/:id                   # Get user details + activity
GET /api/admin/logs                        # Get audit logs with filters
GET /api/admin/activity/:userId            # Get specific user activity
```

---

## 10. Tech Stack

### Backend
- **Next.js 16**: Full-stack framework with App Router
- **Drizzle ORM**: Type-safe database queries
- **Neon PostgreSQL**: Cloud database (no Docker container)
- **NextAuth v4**: Authentication & session management
- **Upstash Redis**: Rate limiting, caching, quota tracking
- **Bcrypt**: Password hashing & verification

### Frontend
- **React 19.2**: UI library
- **TanStack React Query**: Server state management & caching
- **Zustand**: Client state management (global store)
- **Tailwind CSS 4**: Utility-first CSS framework
- **TypeScript**: Type safety

### Deployment & DevOps
- **Docker**: Application containerization
- **Neon**: Managed PostgreSQL database
- **Upstash**: Managed Redis database
- **Vercel/Railway/Render**: Hosting options

---

## 11. Implementation Phase Order

### Phase 1: Foundation
1. ✅ Drizzle ORM schema setup
2. ✅ Neon database connection
3. ✅ NextAuth configuration
4. ✅ Upstash Redis integration

### Phase 2: Core Features
5. ✅ Link creation with deduplication
6. ✅ Rate limiting middleware
7. ✅ URL validation
8. ✅ Redirect & analytics tracking

### Phase 3: User Interface
9. ✅ Public pages (Home, Pricing, About)
10. ✅ Auth pages (Login, Register)
11. ✅ User dashboard
12. ✅ Link management CRUD

### Phase 4: Analytics & Admin
13. ✅ Analytics dashboard
14. ✅ Admin dashboard
15. ✅ User management
16. ✅ Audit logs

### Phase 5: Polish & Deployment
17. ✅ QR code generation
18. ✅ Error handling & validation
19. ✅ Testing (unit + integration)
20. ✅ Docker setup
21. ✅ Deployment & monitoring

---

## 12. Folder Structure

```
URL shortener project/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, register)
│   ├── (public)/                # Public pages (home, pricing, about)
│   ├── (protected)/             # Protected routes (dashboard, admin)
│   ├── api/                     # API routes
│   ├── r/                       # Redirect endpoint
│   ├── expired/                 # Expired link page
│   └── layout.tsx
├── lib/                         # Core logic
│   ├── db/                      # Drizzle client & schema
│   ├── auth/                    # NextAuth config
│   ├── redis/                   # Redis client & rate limiting
│   ├── validators/              # URL & data validation
│   └── utils.ts
├── hooks/                       # Custom React hooks
├── store/                       # Zustand stores
├── components/                  # React components
├── types/                       # TypeScript definitions
├── middleware.ts                # Next.js middleware
├── public/                      # Static assets
├── styles/                      # Global styles
├── .env.local                   # Environment variables
├── Dockerfile
├── docker-compose.yml
├── drizzle.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 13. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname

# Redis (Upstash)
REDIS_URL=redis://default:password@xxx.upstash.io:port

# NextAuth
NEXTAUTH_SECRET=generated-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Email service for notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

## 14. Key Edge Cases Handled

✅ **Deduplication**: Same URL by same user returns existing code, doesn't count quota  
✅ **Expired Links**: Dedicated page with extend option for Pro users  
✅ **Rate Limiting**: All requests count, monthly reset on 1st  
✅ **URL Validation**: Localhost, malicious sites, adult content blocked  
✅ **Quota Enforcement**: Free (50/month), Pro (1000/month)  
✅ **Admin Audit Trail**: All user actions tracked with timestamps  
✅ **Soft Delete**: Expired links kept for analytics history  
✅ **Authentication Required**: No anonymous access, login mandatory  
✅ **Deduplication per User**: Different users get different codes for same URL  

---

## 15. Success Metrics

- ✅ Authentication system working correctly
- ✅ Link creation with proper deduplication
- ✅ Rate limiting preventing quota overages
- ✅ Analytics tracking clicks accurately
- ✅ Admin can view all users and activity
- ✅ User dashboard fully functional
- ✅ Public pages informative and attractive
- ✅ Docker deployment successful
- ✅ Neon database connected properly
- ✅ Upstash Redis rate limiting active

---

## Notes

- This is an **MVP** (Minimum Viable Product)
- Payment processing is not included in this version
- Subscription plan upgrades would be handled manually or via future integration
- Admin features are basic; can be expanded later
- QR code generation can use a library like `qrcode.react`
- Analytics can be enhanced with more detailed insights in future versions

---

**Created**: November 14, 2025  
**Status**: Planning Phase - Ready for Implementation
