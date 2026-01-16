# Stack Research: Wedding Website Platform

**Project:** Multi-tenant Wedding Website SaaS
**Researched:** 2026-01-16
**Overall Confidence:** HIGH

## Executive Summary

For a multi-tenant wedding website SaaS with custom domains, RSVP management, gift registries with payment QR codes, and photo sharing, the recommended stack is:

**Next.js 15 + PostgreSQL + Prisma + Clerk + shadcn/ui + Vercel**

This stack is battle-tested for multi-tenant SaaS, has excellent documentation, strong community support, and provides the fastest path to production while maintaining flexibility for scale.

---

## Recommended Stack

### Frontend Framework

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Next.js** | 15.5+ | HIGH | Industry standard for React SaaS. Native multi-tenant support with middleware. Vercel's Platforms Starter Kit proves the pattern. Server Components reduce client bundle. Turbopack provides fast DX. |

**Key Features for This Project:**
- Middleware-based subdomain routing for custom domains per couple
- Server Actions for form handling (RSVP submissions)
- Image optimization for photo galleries
- ISR for wedding sites (rarely change, need fast loads)

**Source:** [Next.js 15 Release](https://nextjs.org/blog/next-15), [Vercel Multi-tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application)

### UI Library

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **shadcn/ui** | Latest | HIGH | Copy-paste components = full ownership. Built on Radix UI (accessibility). Tailwind-native. Smallest bundle size. Wedding sites need custom branding - shadcn allows complete control. |
| **Tailwind CSS** | 4.x | HIGH | Utility-first CSS. Pairs perfectly with shadcn/ui. Excellent for responsive design. Easy theming for per-couple customization. |

**Alternatives Considered:**

| Alternative | Why Not |
|-------------|---------|
| MUI (Material UI) | Opinionated Material Design aesthetic conflicts with wedding branding needs. Larger bundle (~95kb). |
| Chakra UI | Good DX but heavier than shadcn. Less customizable for unique wedding themes. |

**Source:** [React UI Libraries 2025 Comparison](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)

### State Management

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **TanStack Query** | 5.x | HIGH | Server state management. Handles RSVP fetching, guest lists, photo galleries. Auto-caching, background refetching. |
| **Zustand** | 5.x | MEDIUM | Client state only if needed. Minimal boilerplate. ~3KB bundle. Most state will be server-side with TanStack Query. |

**Rationale:** Wedding sites are read-heavy with occasional writes (RSVPs, photo uploads). TanStack Query handles this pattern perfectly. Zustand only needed for UI state like modals, form wizards.

**Source:** [State Management 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k), [TanStack Query Docs](https://tanstack.com/query/latest)

### Form Handling

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **React Hook Form** | 7.x | HIGH | Smallest bundle (~12KB vs Formik's ~44KB). Uncontrolled components = fewer re-renders. Perfect for RSVP forms with multiple guests. |
| **Zod** | 3.x | HIGH | TypeScript-first validation. Works seamlessly with React Hook Form. Same schemas for client and server validation. |

**Why Not Formik:** Larger bundle, more re-renders, falling behind in features and community momentum.

**Source:** [React Hook Form vs Formik 2025](https://www.digitalogy.co/blog/react-hook-form-vs-formik/)

---

### Backend / API

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Next.js API Routes + Server Actions** | 15.5+ | HIGH | No separate backend needed. Server Actions simplify mutations. API routes for webhooks. Colocation with frontend. |

**Architecture Pattern:**
- Server Actions for mutations (RSVP submit, photo upload, settings save)
- API Routes for webhooks (payment notifications) and external integrations
- No separate backend service needed until 100k+ couples

---

### Authentication

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Clerk** | Latest | HIGH | Purpose-built for multi-tenant B2B SaaS. Organizations feature handles couple accounts. Pre-built UI components. Passkey support. $0.02/MAU after 10k is predictable. |

**Key Features for This Project:**
- Organizations = Couple accounts (co-owners of wedding site)
- User roles: Admin (you), Couple (site owners), Guest (RSVP-only)
- Pre-built sign-in/up components
- Social login (Google, Apple) for guest convenience
- Passwordless/magic link for guests

**Alternatives Considered:**

| Alternative | Why Not |
|-------------|---------|
| Auth.js (NextAuth) | More control but significant dev time. No built-in organization/multi-tenant support. MFA requires custom implementation. |
| Supabase Auth | Tied to Supabase ecosystem. Less flexible for our architecture. |

**Cost Note:** At 10k couples + their guests, Clerk costs ~$200/month. Reasonable for the time saved.

**Source:** [Clerk vs NextAuth 2025](https://artechway.com/blog/the-ultimate-nextjs-auth-showdown-nextauthjs-vs-clerk-2025-guide), [Clerk Multi-tenant Guide](https://clerk.com/blog/how-to-design-multitenant-saas-architecture)

---

### Database

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **PostgreSQL** | 16+ | HIGH | Industry standard. Row-Level Security for tenant isolation. JSON columns for flexible wedding settings. Full-text search for guest lists. |
| **Neon** | Serverless | HIGH | Serverless Postgres. Scales to zero (cost-effective for development). Branching for preview deployments. ~$20/month for production workloads. |

**Multi-Tenant Strategy:** Shared database with tenant IDs + Row-Level Security (RLS)

```sql
-- Example RLS policy
CREATE POLICY tenant_isolation ON guests
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = current_setting('app.current_couple')::uuid
  ));
```

**Why Shared Database:** Wedding sites are small (100-500 guests each). Schema-per-tenant or DB-per-tenant is massive overkill. Shared database with RLS is proven, simple, cost-effective.

**Alternatives Considered:**

| Alternative | Why Not |
|-------------|---------|
| Supabase | Great BaaS but overkill. We don't need their Auth (using Clerk), Realtime, or Edge Functions. Pay for unused features. |
| PlanetScale | MySQL-based. PostgreSQL has better JSON support, RLS, and ecosystem for this use case. |
| MongoDB | No ACID transactions. Relational data (weddings -> guests -> RSVPs) fits SQL better. |

**Source:** [Multi-tenant RLS Guide](https://www.thenile.dev/blog/multi-tenant-rls), [Neon vs Supabase 2025](https://www.bytebase.com/blog/neon-vs-supabase/)

### ORM

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Prisma** | 6.x | HIGH | Best DX for TypeScript. Prisma Studio for debugging. Mature migrations. Strong Next.js integration. |

**Why Not Drizzle:** Drizzle is faster and lighter, but Prisma's DX wins for a SaaS MVP. Prisma Studio helps non-technical debugging. Can migrate to Drizzle later if performance becomes critical.

**Rationale:** Wedding sites have simple queries. Prisma's ~10ms overhead is negligible. Type safety and migration tooling more valuable than raw performance.

**Source:** [Prisma vs Drizzle 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)

---

### File Storage (Photos)

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Cloudflare R2** | - | HIGH | S3-compatible. **Zero egress fees** (critical for photo-heavy wedding sites). $0.015/GB storage. Global CDN built-in. |

**Why Zero Egress Matters:** Wedding photo galleries will be viewed many times by guests. With AWS S3, a 10GB gallery viewed 100 times = $90 in egress. With R2 = $0.

**Integration:**
```typescript
// Presigned URLs for direct upload from client
const uploadUrl = await r2.createPresignedPost({
  bucket: 'wedding-photos',
  key: `${weddingId}/${photoId}`,
  expiresIn: 3600
});
```

**Alternatives Considered:**

| Alternative | Why Not |
|-------------|---------|
| AWS S3 | Egress fees kill margins for photo-sharing features |
| UploadThing | Higher cost at scale, less control |
| Vercel Blob | More expensive than R2 for storage-heavy use cases |

**Source:** [R2 vs S3 Comparison](https://www.digitalapplied.com/blog/cloudflare-r2-vs-aws-s3-comparison)

---

### Hosting / Infrastructure

| Technology | Confidence | Why |
|------------|------------|-----|
| **Vercel** | HIGH | Next.js creators. Best DX. Automatic preview deployments. Edge middleware for subdomain routing. Wildcard domain support. |

**Multi-Tenant Domain Setup:**
1. Add wildcard domain `*.weddingplatform.com` in Vercel
2. Middleware extracts subdomain and routes to correct couple's site
3. Custom domains: Couples add CNAME pointing to Vercel, Vercel handles SSL

**Pricing Estimate:** Pro plan ($20/month) + usage. For a wedding SaaS, likely $50-150/month.

**Source:** [Vercel Platforms Starter Kit](https://github.com/vercel/platforms), [Next.js Multi-tenant Docs](https://nextjs.org/docs/app/guides/multi-tenant)

### CDN

| Technology | Confidence | Why |
|------------|------------|-----|
| **Cloudflare** | HIGH | Already using R2. Free CDN tier. DDoS protection. Edge caching. DNS management for custom domains. |

---

### Email

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **Resend** | Latest | HIGH | React Email for templates. Modern DX. 3k emails/month free. Perfect for RSVP confirmations, reminders. |

**Use Cases:**
- RSVP confirmation emails
- Wedding reminder emails (1 week before)
- Admin notifications

**Integration:**
```typescript
import { Resend } from 'resend';
import { RSVPConfirmation } from '@/emails/rsvp-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@weddingplatform.com',
  to: guest.email,
  subject: `RSVP Confirmed - ${wedding.coupleName}'s Wedding`,
  react: RSVPConfirmation({ guest, wedding })
});
```

**Source:** [Resend vs SendGrid 2025](https://nextbuild.co/blog/resend-vs-sendgrid-vs-ses-email)

---

### Payment Integration

#### QR Code Generation

| Technology | Version | Confidence | Why |
|------------|---------|------------|-----|
| **qrcode.react** | 4.x | HIGH | React-native QR generation. SVG output. Logo embedding support. 1M+ weekly downloads. |

```typescript
import { QRCodeSVG } from 'qrcode.react';

// Generate QR for bank transfer
<QRCodeSVG
  value={`https://pay.example.com/${weddingId}/${giftId}`}
  size={200}
  imageSettings={{
    src: "/couple-logo.png",
    excavate: true
  }}
/>
```

#### Payment Methods

| Method | Integration Approach | Confidence |
|--------|---------------------|------------|
| **Bank Transfer** | Display IBAN + QR code with payment reference | HIGH |
| **PayPal** | `@paypal/react-paypal-js` SDK | HIGH |
| **Twint** | Via payment provider (Adyen, Worldline, or Checkout.com) | MEDIUM |

**Twint Note:** Twint does NOT offer a public API. Must integrate through a payment service provider like:
- Adyen (recommended - good docs, supports Twint)
- Worldline (Swiss company, strong Twint support)
- Checkout.com

**Architecture:**
```
Gift Registry Flow:
1. Guest selects gift -> sees payment options
2. Bank: Show IBAN + amount + reference, QR encodes same
3. PayPal: Redirect to PayPal checkout
4. Twint: Generate Twint QR via payment provider API
5. Webhook confirms payment -> mark gift as received
```

**Source:** [Twint Integration Options](https://www.twint.ch/en/business-customers/our-solutions/integrators/), [PayPal React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js)

---

## Complete Dependency List

### Production Dependencies

```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "@clerk/nextjs": "^6.0.0",

    "@prisma/client": "^6.0.0",

    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",

    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",

    "qrcode.react": "^4.2.0",
    "@paypal/react-paypal-js": "^8.0.0",

    "resend": "^4.0.0",
    "@react-email/components": "^0.0.30",

    "@aws-sdk/client-s3": "^3.700.0",
    "@aws-sdk/s3-request-presigner": "^3.700.0",

    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",

    "prisma": "^6.0.0",

    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",

    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

### shadcn/ui Components to Install

```bash
npx shadcn@latest init
npx shadcn@latest add button card form input label select textarea
npx shadcn@latest add dialog sheet dropdown-menu
npx shadcn@latest add avatar badge separator
npx shadcn@latest add tabs accordion
npx shadcn@latest add toast sonner
npx shadcn@latest add table data-table
npx shadcn@latest add calendar date-picker
```

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| **Redux** | Overkill for this app. TanStack Query handles server state, Zustand for minimal client state. Redux adds unnecessary complexity. |
| **Formik** | Larger bundle, more re-renders, less active development than React Hook Form. |
| **MongoDB** | Relational data (weddings -> guests -> RSVPs -> dietary requirements) fits SQL. No benefit from document model here. |
| **AWS S3** | Egress fees will destroy margins for photo-heavy wedding sites. Use R2. |
| **Self-hosted auth** | Auth is critical and hard. Clerk's $0.02/MAU is worth avoiding security vulnerabilities and saving dev time. |
| **Microservices** | Massive overkill for MVP. Start with Next.js monolith. Can extract services later if needed. |
| **GraphQL** | REST/Server Actions are simpler for this app's needs. No complex data relationships requiring GraphQL flexibility. |
| **tRPC** | Server Actions in Next.js 15 provide similar type-safety with less setup. tRPC adds complexity without proportional benefit here. |
| **Firebase** | Vendor lock-in. Firestore's pricing model is unpredictable. PostgreSQL + standard stack is more portable. |
| **Remix** | Good framework but Next.js has better multi-tenant patterns (Platforms Starter Kit), larger ecosystem, and Vercel's native support. |

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Next.js 15 | HIGH | Verified via official docs. Vercel Platforms Starter Kit proves multi-tenant pattern. |
| PostgreSQL + Prisma | HIGH | Industry standard. RLS pattern well-documented. |
| Clerk | HIGH | Official multi-tenant docs. Organization feature fits couple accounts perfectly. |
| shadcn/ui + Tailwind | HIGH | Verified via official repos. Flexible for custom branding. |
| Cloudflare R2 | HIGH | S3-compatible, zero egress verified via official pricing. |
| Resend | HIGH | React Email integration verified. Free tier sufficient for MVP. |
| Twint Integration | MEDIUM | Must use PSP. No direct API. Adyen/Worldline docs confirm support but requires account setup and approval. |
| Payment QR Codes | HIGH | qrcode.react verified, PayPal SDK documented. Bank transfer QR is static text encoding. |

---

## Architecture Overview

```
                                   +------------------+
                                   |    Cloudflare    |
                                   |   (CDN + DNS)    |
                                   +--------+---------+
                                            |
                                            v
+------------------+              +------------------+
|   Custom Domain  |  CNAME  ->  |     Vercel       |
| smith-wedding.com|              |   (Next.js 15)   |
+------------------+              +--------+---------+
                                            |
                     +----------------------+----------------------+
                     |                      |                      |
                     v                      v                      v
            +--------+--------+   +--------+--------+   +------------------+
            |    Middleware   |   |   Server        |   |   API Routes     |
            | (Subdomain      |   |   Actions       |   |   (Webhooks)     |
            |  Routing)       |   +--------+--------+   +--------+---------+
            +--------+--------+            |                      |
                     |                     v                      v
                     |           +------------------+   +------------------+
                     |           |     Prisma       |   |   Payment PSP    |
                     |           +--------+---------+   |   (Adyen)        |
                     |                    |             +------------------+
                     |                    v
                     |           +------------------+
                     +---------> |   Neon Postgres  |
                                 |   (with RLS)     |
                                 +------------------+

External Services:
+------------------+  +------------------+  +------------------+
|      Clerk       |  |  Cloudflare R2   |  |     Resend       |
|   (Auth)         |  |  (Photos)        |  |   (Email)        |
+------------------+  +------------------+  +------------------+
```

---

## Monthly Cost Estimate (MVP with ~100 couples)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20 | Base plan |
| Neon | ~$20 | Serverless Postgres |
| Clerk | $0 | Free tier (10k MAU) |
| Cloudflare R2 | ~$5 | 10GB photos, zero egress |
| Resend | $0 | Free tier (3k emails) |
| Custom domains SSL | $0 | Vercel handles |
| **Total** | **~$45/month** | |

At 1,000 couples: ~$150-200/month

---

## Sources

### Official Documentation
- [Next.js 15 Release](https://nextjs.org/blog/next-15)
- [Next.js Multi-tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant)
- [Vercel Platforms Starter Kit](https://github.com/vercel/platforms)
- [Clerk Multi-tenant Architecture](https://clerk.com/blog/how-to-design-multitenant-saas-architecture)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Comparisons & Analysis
- [Multi-tenant SaaS Best Practices - WorkOS](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [Next.js vs Remix 2025 - Strapi](https://strapi.io/blog/next-js-vs-remix-2025-developer-framework-comparison-guide)
- [Prisma vs Drizzle - Bytebase](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [Clerk vs NextAuth 2025 - ArtechWay](https://artechway.com/blog/the-ultimate-nextjs-auth-showdown-nextauthjs-vs-clerk-2025-guide)
- [shadcn/ui vs Chakra vs MUI - Makers Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
- [R2 vs S3 - Digital Applied](https://www.digitalapplied.com/blog/cloudflare-r2-vs-aws-s3-comparison)
- [Neon vs Supabase - Bytebase](https://www.bytebase.com/blog/neon-vs-supabase/)
- [State Management 2025 - DEV](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [Resend vs SendGrid - NextBuild](https://nextbuild.co/blog/resend-vs-sendgrid-vs-ses-email)

### Payment Integration
- [Twint Integration Options](https://www.twint.ch/en/business-customers/our-solutions/integrators/)
- [Twint via Adyen](https://docs.adyen.com/payment-methods/twint/api-only)
- [PayPal React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [qrcode.react](https://www.npmjs.com/package/qrcode.react)
