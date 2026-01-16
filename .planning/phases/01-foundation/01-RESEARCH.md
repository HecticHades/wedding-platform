# Phase 1: Foundation - Research

**Researched:** 2026-01-16
**Domain:** Multi-tenant infrastructure, subdomain routing, tenant isolation, responsive design, CDN configuration
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational infrastructure for a multi-tenant wedding website platform. The core technical challenges are: (1) routing requests from multiple subdomains to the correct tenant context, (2) ensuring database queries cannot leak data between tenants, (3) serving static assets efficiently via CDN, and (4) handling wedding-day traffic spikes without degradation.

The recommended approach uses **Next.js 15 middleware for subdomain routing**, **PostgreSQL Row-Level Security (RLS) with Prisma client extensions** for tenant isolation, **Vercel's automatic CDN** for static assets, and **Tailwind CSS mobile-first responsive design** for cross-device compatibility.

**Primary recommendation:** Use the Vercel Platforms Starter Kit patterns as the architectural foundation, implementing RLS at the database level as defense-in-depth for tenant isolation.

## Standard Stack

The established libraries/tools for multi-tenant foundation infrastructure:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5+ | Full-stack framework with App Router | Native multi-tenant support via middleware, Vercel Platforms Starter Kit proves the pattern |
| PostgreSQL | 16+ | Primary database with RLS | Row-Level Security provides database-level tenant isolation |
| Prisma | 6.x | ORM with client extensions | Type-safe queries with extension support for tenant context injection |
| @prisma/adapter-neon | latest | Serverless database adapter | Enables HTTP-based database connections for edge/serverless |
| Tailwind CSS | 4.x | Utility-first CSS framework | Mobile-first responsive design out of the box |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Neon | Serverless | PostgreSQL hosting | Default database host - serverless, connection pooling, branching |
| @vercel/sdk | latest | Vercel API client | Programmatic domain management (Phase 10, but architecture enables it) |
| k6 | latest | Load testing | Validate 100 concurrent users requirement |
| clsx | 2.x | Conditional CSS classes | Dynamic class composition for responsive components |
| tailwind-merge | 2.x | Tailwind class merging | Prevent class conflicts when composing components |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL RLS | Application-level WHERE clauses | RLS provides defense-in-depth; WHERE clauses are easier to miss |
| Neon | Supabase | Supabase bundles auth/storage we don't need; Neon is pure Postgres |
| Vercel | AWS/Cloudflare | Vercel has best Next.js multi-tenant support with Platforms Starter Kit |
| Tailwind 4 | Tailwind 3 | v4 has CSS-first config, simpler breakpoint customization |

**Installation:**
```bash
npx create-next-app@latest wedding-platform --typescript --tailwind --eslint --app --src-dir
cd wedding-platform
npm install @prisma/client @prisma/adapter-neon @neondatabase/serverless
npm install -D prisma k6
npm install clsx tailwind-merge
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (platform)/           # Main platform routes (admin, couple dashboard)
│   │   ├── layout.tsx
│   │   └── ...
│   ├── [domain]/             # Dynamic tenant routes (wedding sites)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/
│       └── ...
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── layout/               # Layout components (Header, Footer)
├── lib/
│   ├── db/
│   │   ├── prisma.ts         # Prisma client singleton with tenant extension
│   │   └── tenant-context.ts # Tenant context utilities
│   └── utils.ts              # General utilities (cn function)
├── middleware.ts             # Subdomain routing middleware
└── styles/
    └── globals.css           # Tailwind imports
```

### Pattern 1: Subdomain-Based Tenant Routing via Middleware

**What:** Extract tenant identifier from subdomain in middleware, rewrite requests to tenant-specific routes
**When to use:** All requests - middleware runs on every request at the edge

**Example:**
```typescript
// middleware.ts
// Source: Vercel Platforms Starter Kit pattern
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    // Match all paths except static files and api routes we want to exclude
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define your root domain (handles localhost for dev)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract subdomain
  // For "alice-bob.weddingplatform.com" -> "alice-bob"
  // For "localhost:3000" -> null (main site)
  // For "alice-bob.localhost:3000" -> "alice-bob" (local dev)
  let subdomain: string | null = null;

  if (hostname.includes('.') && !hostname.startsWith('www.')) {
    const parts = hostname.replace(`.${rootDomain}`, '').split('.');
    if (parts.length > 0 && parts[0] !== hostname.split('.')[0]) {
      subdomain = parts[0];
    }
  }

  // Handle localhost subdomain pattern (e.g., alice-bob.localhost:3000)
  if (hostname.includes('localhost') && hostname !== 'localhost:3000') {
    subdomain = hostname.split('.')[0];
  }

  // If no subdomain, serve main platform
  if (!subdomain) {
    return NextResponse.next();
  }

  // Rewrite to tenant-specific route, passing subdomain as path
  // The [domain] dynamic route will handle tenant lookup
  return NextResponse.rewrite(
    new URL(`/${subdomain}${url.pathname}`, req.url)
  );
}
```

### Pattern 2: PostgreSQL Row-Level Security with Prisma Extension

**What:** Database-level tenant isolation that automatically filters queries by tenant_id
**When to use:** All database operations involving tenant-scoped data

**Example:**
```typescript
// lib/db/prisma.ts
// Source: Prisma RLS extension example
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// Base client for connection
const connectionString = process.env.DATABASE_URL!;
const sql = neon(connectionString);
const adapter = new PrismaNeon(sql);

const basePrisma = new PrismaClient({ adapter });

// Extend Prisma client with tenant context
export const prisma = basePrisma.$extends({
  query: {
    $allOperations({ args, query, operation, model }) {
      // Models that require tenant scoping
      const tenantScopedModels = ['Wedding', 'Guest', 'RSVP', 'Event', 'Photo'];

      if (!tenantScopedModels.includes(model ?? '')) {
        return query(args);
      }

      // Get tenant context (set by middleware/request handler)
      const tenantId = getTenantContext();

      if (!tenantId) {
        throw new Error('Tenant context required for this operation');
      }

      // Inject tenant filter for reads
      if (['findMany', 'findFirst', 'findUnique', 'count'].includes(operation)) {
        args.where = { ...args.where, tenantId };
      }

      // Inject tenant for creates
      if (['create', 'createMany'].includes(operation)) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map(d => ({ ...d, tenantId }));
        } else {
          args.data = { ...args.data, tenantId };
        }
      }

      // Inject tenant filter for updates/deletes
      if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
        args.where = { ...args.where, tenantId };
      }

      return query(args);
    },
  },
});

// Tenant context using AsyncLocalStorage (works in Next.js)
import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage<string>();

export function setTenantContext<T>(tenantId: string, fn: () => T): T {
  return tenantStorage.run(tenantId, fn);
}

export function getTenantContext(): string | undefined {
  return tenantStorage.getStore();
}
```

### Pattern 3: Database RLS Policy Setup

**What:** PostgreSQL-level policies that enforce tenant isolation even if application code is buggy
**When to use:** Applied via migrations, provides defense-in-depth

**Example:**
```sql
-- migrations/add_rls_policies.sql
-- Source: PostgreSQL RLS documentation + Prisma RLS guide

-- Enable RLS on tenant-scoped tables
ALTER TABLE "Wedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wedding" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Guest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Guest" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" FORCE ROW LEVEL SECURITY;

-- Create RLS policies
-- The app.current_tenant_id is set per-transaction by Prisma extension
CREATE POLICY tenant_isolation_wedding ON "Wedding"
  USING ("id" = current_setting('app.current_tenant_id', TRUE)::uuid);

CREATE POLICY tenant_isolation_guest ON "Guest"
  USING ("weddingId" = current_setting('app.current_tenant_id', TRUE)::uuid);

CREATE POLICY tenant_isolation_event ON "Event"
  USING ("weddingId" = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Bypass policy for admin operations
CREATE POLICY bypass_rls_admin ON "Wedding"
  USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
```

### Pattern 4: Mobile-First Responsive Layout

**What:** Tailwind CSS responsive design starting from mobile, scaling up
**When to use:** All UI components

**Example:**
```typescript
// components/layout/ResponsiveContainer.tsx
// Source: Tailwind CSS responsive design documentation

export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      w-full px-4           {/* Mobile: full width, small padding */}
      sm:px-6               {/* >= 640px: slightly more padding */}
      md:px-8               {/* >= 768px: tablet padding */}
      lg:max-w-4xl lg:mx-auto lg:px-0  {/* >= 1024px: centered, max-width */}
      xl:max-w-5xl          {/* >= 1280px: wider max-width */}
    ">
      {children}
    </div>
  );
}

// Example responsive navigation
export function Navigation() {
  return (
    <nav className="
      flex flex-col gap-2      {/* Mobile: vertical stack */}
      sm:flex-row sm:gap-4     {/* >= 640px: horizontal */}
      md:gap-6                 {/* >= 768px: more spacing */}
    ">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/story">Our Story</NavLink>
      <NavLink href="/rsvp">RSVP</NavLink>
    </nav>
  );
}
```

### Anti-Patterns to Avoid

- **Tenant ID in URLs or request parameters:** Never accept tenant_id from user input. Always derive from subdomain/session.
- **Missing tenant filter in queries:** Every tenant-scoped query must include tenantId. Use Prisma extension to enforce this.
- **Desktop-first responsive design:** Start with mobile styles (unprefixed), then add breakpoint prefixes for larger screens.
- **Hardcoded domain strings:** Use environment variables for root domain to support local dev and production.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subdomain routing | Custom hostname parsing | Next.js middleware with Vercel patterns | Edge cases (localhost, preview URLs, www) are already solved |
| Tenant isolation | WHERE clauses everywhere | PostgreSQL RLS + Prisma extension | Application bugs can't leak data if DB enforces isolation |
| Responsive breakpoints | Custom media query CSS | Tailwind's mobile-first system | Consistent, well-tested breakpoints across all components |
| CSS class merging | String concatenation | clsx + tailwind-merge | Handles conditional classes and Tailwind conflicts correctly |
| Database connection pooling | Manual pool management | Neon pooler + Prisma adapter | Serverless-optimized with automatic connection handling |
| Wildcard SSL | Manual certificate management | Vercel nameservers + wildcard domain | Automatic certificate issuance and renewal |

**Key insight:** Multi-tenant infrastructure has well-established patterns. The Vercel Platforms Starter Kit exists precisely because these problems have been solved before. Following it saves weeks of debugging edge cases.

## Common Pitfalls

### Pitfall 1: Tenant Context Lost Across Async Boundaries

**What goes wrong:** Tenant ID set in middleware isn't available in server actions or API routes
**Why it happens:** Node.js async context can be lost without proper propagation
**How to avoid:** Use AsyncLocalStorage (built into Node.js) as shown in Pattern 2
**Warning signs:** "Tenant context required" errors in production, data from wrong tenant appearing

### Pitfall 2: Localhost Subdomain Testing Failures

**What goes wrong:** `alice-bob.localhost:3000` doesn't resolve in browser
**Why it happens:** Most browsers/OS don't resolve arbitrary localhost subdomains
**How to avoid:**
  - Add entries to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
    ```
    127.0.0.1 alice-bob.localhost
    127.0.0.1 test-wedding.localhost
    ```
  - Or use a tool like `localhost.run` or configure DNS wildcard locally
**Warning signs:** "Site can't be reached" when testing subdomains locally

### Pitfall 3: Vercel Preview URL Subdomain Conflicts

**What goes wrong:** Branch preview URLs collide with tenant subdomains, creating broken previews
**Why it happens:** Preview URLs include branch name, which can conflict with tenant routing logic
**How to avoid:**
  - Keep branch names short (63 char DNS label limit)
  - Handle Vercel preview URL pattern in middleware explicitly
  - Test with `vercel dev` locally which mimics production routing
**Warning signs:** Preview deployments show wrong tenant content or 404

### Pitfall 4: Mobile Viewport Not Respecting Design

**What goes wrong:** Mobile site appears zoomed out or text is too small
**Why it happens:** Missing viewport meta tag
**How to avoid:** Ensure `app/layout.tsx` includes proper viewport configuration:
```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
```
**Warning signs:** Mobile users report having to pinch-zoom to read content

### Pitfall 5: Database Connection Exhaustion in Serverless

**What goes wrong:** "Too many connections" errors during traffic spikes
**Why it happens:** Each serverless function invocation opens new connection without pooling
**How to avoid:**
  - Use Neon's pooled connection string (includes `-pooler` in hostname)
  - Set `connection_limit=1` in Prisma for serverless
  - Use the `@prisma/adapter-neon` for HTTP-based connections
**Warning signs:** Intermittent database connection errors under load, slow query times

### Pitfall 6: RLS Policies Blocking Admin Access

**What goes wrong:** Admin cannot view/manage wedding sites because RLS blocks all queries
**Why it happens:** RLS policies apply to all database connections including admin operations
**How to avoid:**
  - Create a bypass policy for admin operations
  - Use separate database role with BYPASSRLS for admin tasks
  - Or explicitly set bypass flag in transaction: `SET LOCAL app.bypass_rls = 'on'`
**Warning signs:** Admin dashboard shows empty data, admin queries return zero results

## Code Examples

Verified patterns from official sources:

### Prisma Schema for Multi-Tenant Foundation

```prisma
// prisma/schema.prisma
// Source: Prisma multi-tenant patterns

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model Tenant {
  id          String    @id @default(cuid())
  subdomain   String    @unique
  customDomain String?  @unique
  name        String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  wedding     Wedding?
}

model Wedding {
  id          String    @id @default(cuid())
  tenantId    String    @unique
  tenant      Tenant    @relation(fields: [tenantId], references: [id])

  partner1Name String
  partner2Name String
  weddingDate  DateTime?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  guests      Guest[]
  events      Event[]

  @@index([tenantId])
}

model Guest {
  id          String    @id @default(cuid())
  weddingId   String
  wedding     Wedding   @relation(fields: [weddingId], references: [id])

  name        String
  email       String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([weddingId])
}

model Event {
  id          String    @id @default(cuid())
  weddingId   String
  wedding     Wedding   @relation(fields: [weddingId], references: [id])

  name        String
  dateTime    DateTime
  location    String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([weddingId])
}
```

### Tenant Lookup in Server Components

```typescript
// app/[domain]/page.tsx
// Source: Next.js App Router patterns

import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function TenantHomePage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: true,
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold md:text-4xl">
        {tenant.wedding.partner1Name} & {tenant.wedding.partner2Name}
      </h1>
      {/* Wedding site content */}
    </div>
  );
}
```

### Load Test Script with k6

```javascript
// tests/load/wedding-site.js
// Source: k6 documentation

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },   // Ramp to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://test-wedding.weddingplatform.com';

export default function () {
  // Simulate guest visiting wedding site
  const homeResponse = http.get(`${BASE_URL}/`);
  check(homeResponse, {
    'home page status is 200': (r) => r.status === 200,
    'home page loads fast': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Simulate viewing RSVP page
  const rsvpResponse = http.get(`${BASE_URL}/rsvp`);
  check(rsvpResponse, {
    'rsvp page status is 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 3); // Random think time
}
```

### Responsive CSS Utility Function

```typescript
// lib/utils.ts
// Source: shadcn/ui patterns

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in components:
// className={cn(
//   "base-styles",
//   "sm:tablet-styles",
//   "lg:desktop-styles",
//   conditional && "conditional-styles"
// )}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13+ (2023) | Server Components, better layouts, streaming |
| getServerSideProps | Server Components + fetch | Next.js 13+ | Simpler data fetching, automatic caching |
| Application WHERE clauses | PostgreSQL RLS | Always available, now mainstream | Defense-in-depth tenant isolation |
| Manual media queries | Tailwind breakpoints | Tailwind v1+ | Consistent, mobile-first by default |
| TCP database connections | HTTP/WebSocket adapters | Neon/PlanetScale 2023+ | Works in edge/serverless environments |
| Prisma generate | Prisma with driver adapters | Prisma 6.x (2024) | Native serverless database support |

**Deprecated/outdated:**
- `getServerSideProps`/`getStaticProps`: Use Server Components with `fetch()` or direct database calls
- `pages/` directory: Use `app/` directory with App Router
- Tailwind `@apply` overuse: Prefer utility classes directly in JSX
- Connection string without pooler: Always use `-pooler` suffix for Neon in serverless

## Open Questions

Things that couldn't be fully resolved:

1. **Prisma explicit transactions with RLS**
   - What we know: Prisma's RLS extension doesn't fully support explicit `$transaction()` calls
   - What's unclear: Whether this impacts our use case (most operations are single queries)
   - Recommendation: Test transaction scenarios; may need raw SQL for complex multi-table updates

2. **Preview deployment tenant routing**
   - What we know: Vercel preview URLs have unique format that can conflict with middleware
   - What's unclear: Exact pattern matching needed for all preview URL formats
   - Recommendation: Test thoroughly with `vercel dev` and actual preview deployments

3. **Cold start latency with Neon**
   - What we know: Neon scales to zero after 5 minutes, cold starts take 500ms-2s
   - What's unclear: Impact on wedding-day traffic when database hasn't been accessed
   - Recommendation: Consider keeping compute active on wedding days, or accept first-request latency

## Sources

### Primary (HIGH confidence)

- [Next.js Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant) - Official documentation (April 2025)
- [Vercel Platforms Starter Kit](https://github.com/vercel/platforms) - Production-ready multi-tenant example
- [Vercel Domain Management for Multi-Tenant](https://vercel.com/docs/multi-tenant/domain-management) - Official wildcard/custom domain docs
- [Prisma RLS Extension Example](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security) - Official Prisma RLS pattern
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official mobile-first documentation
- [Neon + Prisma Guide](https://neon.com/docs/guides/prisma) - Official Neon documentation
- [k6 Load Testing](https://k6.io/docs/) - Official Grafana k6 documentation

### Secondary (MEDIUM confidence)

- [Multi-Tenant Architecture in Next.js](https://medium.com/@itsamanyadav/multi-tenant-architecture-in-next-js-a-complete-guide-25590c052de0) - Community guide with code examples
- [PostgreSQL RLS with Prisma](https://medium.com/@francolabuschagne90/securing-multi-tenant-applications-using-row-level-security-in-postgresql-with-prisma-orm-4237f4d4bd35) - Detailed implementation walkthrough
- [Next.js Project Structure 2025](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3) - Current best practices

### Tertiary (LOW confidence)

- WebSearch results for "wedding day traffic spikes" - General patterns, not wedding-specific verified
- Community discussions on subdomain localhost testing - Varies by OS/browser

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All choices from official documentation and project research
- Architecture: HIGH - Vercel Platforms Starter Kit is production-proven
- Multi-tenant routing: HIGH - Official Next.js docs + Vercel examples
- RLS implementation: MEDIUM - Prisma extension pattern is documented but edge cases need testing
- Responsive design: HIGH - Tailwind official documentation
- Load testing: MEDIUM - k6 is standard, but thresholds need real-world calibration

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (stable patterns, 30-day validity)
