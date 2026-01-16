# Phase 2: Admin & Couple Authentication - Research

**Researched:** 2026-01-16
**Domain:** Authentication, authorization, role-based access control, session management, multi-tenant security
**Confidence:** HIGH

## Summary

Phase 2 implements authentication and authorization for two distinct user roles: platform admins (who manage all wedding sites) and couples (who manage only their own site). The core technical challenges are: (1) integrating authentication with the existing multi-tenant context from Phase 1, (2) implementing role-based access control that prevents couples from accessing other couples' data, and (3) providing a secure admin dashboard for platform-wide management.

The recommended approach uses **Auth.js v5 (NextAuth v5)** with the **Prisma adapter** for session persistence, **credentials provider** for email/password authentication, **JWT session strategy** for edge compatibility, and **bcryptjs** for password hashing. Auth.js v5 is the standard authentication library for Next.js App Router and provides native support for role-based access control via session callbacks.

**Primary recommendation:** Use Auth.js v5 with credentials provider and JWT strategy. Extend the session to include user role and tenantId. Verify authorization at both middleware and data access layers (defense-in-depth).

## Standard Stack

The established libraries/tools for authentication in Next.js App Router:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-auth | 5.0.0-beta.25+ | Authentication framework | Official Auth.js for Next.js, native App Router support, universal `auth()` function |
| @auth/prisma-adapter | latest | Database adapter | Persists sessions/users to existing Prisma database |
| bcryptjs | 2.4.3 | Password hashing | Pure JavaScript, Edge runtime compatible, no native dependencies |
| zod | 3.x | Input validation | Type-safe credential validation before authorization |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-table | 8.x | Admin data tables | Admin dashboard for listing/filtering wedding sites |
| shadcn/ui table | latest | Table components | Pre-built accessible table UI with sorting/pagination |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auth.js v5 | Clerk | Clerk is faster to implement but adds vendor lock-in and cost |
| Auth.js v5 | Lucia Auth | Lucia deprecated in March 2025, not recommended for production |
| bcryptjs | bcrypt | bcrypt uses native bindings, incompatible with Edge runtime |
| bcryptjs | Argon2id | More secure but requires native bindings, overkill for wedding platform |
| JWT strategy | Database strategy | Database strategy requires DB calls in middleware, incompatible with Edge |

**Installation:**
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs zod
npm install -D @types/bcryptjs
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (platform)/              # Admin & couple dashboard routes
│   │   ├── admin/               # Admin-only routes
│   │   │   ├── layout.tsx       # Admin layout with auth check
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   └── weddings/        # Wedding management
│   │   ├── dashboard/           # Couple dashboard routes
│   │   │   ├── layout.tsx       # Couple layout with tenant check
│   │   │   └── page.tsx         # Couple's wedding dashboard
│   │   └── layout.tsx           # Shared authenticated layout
│   ├── (auth)/                  # Auth pages (no session required)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # Auth.js route handlers
│   └── [domain]/                # Public wedding sites (existing)
├── lib/
│   ├── auth/
│   │   ├── auth.ts              # Auth.js configuration
│   │   ├── auth.config.ts       # Edge-compatible config (for middleware)
│   │   └── password.ts          # Password hashing utilities
│   └── db/
│       ├── prisma.ts            # Existing Prisma client
│       └── tenant-context.ts    # Existing tenant context
└── types/
    └── next-auth.d.ts           # TypeScript augmentation for Auth.js
```

### Pattern 1: Auth.js Configuration with Role-Based Sessions

**What:** Configure Auth.js with credentials provider, JWT callbacks to include role/tenantId in session
**When to use:** Core authentication configuration

**Example:**
```typescript
// src/lib/auth/auth.ts
// Source: Auth.js official documentation
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import { verifyPassword } from "./password"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT for Edge compatibility
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { tenant: true },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await verifyPassword(
          parsed.data.password,
          user.hashedPassword
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string | null
      }
      return session
    },
  },
})
```

### Pattern 2: TypeScript Module Augmentation for Custom Session

**What:** Extend Auth.js types to include role and tenantId in session
**When to use:** Required for type safety with custom session properties

**Example:**
```typescript
// src/types/next-auth.d.ts
// Source: Auth.js TypeScript documentation
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "couple"
      tenantId: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "admin" | "couple"
    tenantId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "admin" | "couple"
    tenantId: string | null
  }
}
```

### Pattern 3: Edge-Compatible Auth Config Split

**What:** Separate edge-compatible config from database-dependent config for middleware
**When to use:** When using Prisma with middleware (Prisma not edge-compatible by default)

**Example:**
```typescript
// src/lib/auth/auth.config.ts
// Source: Auth.js edge compatibility guide
import type { NextAuthConfig } from "next-auth"

// Edge-compatible config (no database imports)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === "admin"

      // Admin routes require admin role
      if (nextUrl.pathname.startsWith("/admin")) {
        return isAdmin
      }

      // Dashboard requires login
      if (nextUrl.pathname.startsWith("/dashboard")) {
        return isLoggedIn
      }

      return true
    },
  },
  providers: [], // Providers added in full auth.ts
}
```

### Pattern 4: Protected Server Components with Role Check

**What:** Check session and role in Server Components before rendering
**When to use:** All protected pages and components

**Example:**
```typescript
// src/app/(platform)/admin/page.tsx
// Source: Auth.js protecting routes documentation
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard") // Non-admins go to their dashboard
  }

  // Fetch all weddings (admin can see all)
  const weddings = await prisma.wedding.findMany({
    include: { tenant: true },
  })

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Total weddings: {weddings.length}</p>
      {/* Wedding list table */}
    </div>
  )
}
```

### Pattern 5: Couple Dashboard with Tenant Scoping

**What:** Automatically scope couple's view to their tenant
**When to use:** All couple-facing dashboard pages

**Example:**
```typescript
// src/app/(platform)/dashboard/page.tsx
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { withTenantContext } from "@/lib/db/tenant-context"

export default async function CoupleDashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!session.user.tenantId) {
    // User exists but not assigned to a tenant
    redirect("/no-tenant")
  }

  // Use existing tenant context from Phase 1
  const wedding = await withTenantContext(session.user.tenantId, async () => {
    return prisma.wedding.findFirst({
      include: { guests: true, events: true },
    })
  })

  return (
    <div>
      <h1>Your Wedding Dashboard</h1>
      {wedding && (
        <div>
          <p>{wedding.partner1Name} & {wedding.partner2Name}</p>
          <p>Guests: {wedding.guests.length}</p>
        </div>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Relying solely on middleware for auth:** Always verify session at data access layer (defense-in-depth). CVE-2025-29927 showed middleware can be bypassed.
- **Storing passwords in plain text:** Always hash with bcryptjs before storage.
- **Using bcrypt (native) in Edge:** Use bcryptjs (pure JS) which works in all runtimes.
- **Skipping tenant check for couples:** Always verify session.user.tenantId matches requested resource.
- **Admin routes without role verification:** Check role === "admin" in BOTH middleware AND server component.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT/cookie handling | Auth.js | Handles rotation, expiration, CSRF, secure cookies |
| Password hashing | Custom hash functions | bcryptjs with 10+ rounds | Battle-tested, automatic salting, timing-safe comparison |
| Credential validation | Manual if/else checks | Zod schema | Type-safe, detailed error messages, composable |
| Protected routes | Custom HOCs | Auth.js `auth()` + middleware | Consistent pattern, works in RSC/middleware/API routes |
| Data tables | Custom table components | TanStack Table + shadcn/ui | Sorting, filtering, pagination already implemented |
| RBAC | Custom role checks everywhere | Session callbacks + middleware | Centralized, type-safe, consistent |

**Key insight:** Authentication is security-critical. Auth.js is maintained by the Vercel team, receives security patches, and has been audited. Hand-rolling auth introduces vulnerabilities.

## Common Pitfalls

### Pitfall 1: CVE-2025-29927 Middleware Bypass

**What goes wrong:** Attackers bypass middleware auth by spoofing `x-middleware-subrequest` header
**Why it happens:** Next.js versions before 15.2.3 trust this internal header without validation
**How to avoid:**
  - Upgrade to Next.js 15.2.3+ (Next.js 16.1.3 is already patched)
  - Always verify session at data access layer, not just middleware
  - Implement defense-in-depth: middleware + server component + database RLS
**Warning signs:** N/A - already on patched version (16.1.3)

### Pitfall 2: bcrypt Native Module in Edge Runtime

**What goes wrong:** Build fails or runtime error when using `bcrypt` package
**Why it happens:** bcrypt uses native Node.js bindings incompatible with Edge runtime
**How to avoid:** Use `bcryptjs` (pure JavaScript implementation)
**Warning signs:** Error "Module not found: Can't resolve 'bcrypt'" or "Dynamic Code Evaluation"

### Pitfall 3: Prisma in Middleware

**What goes wrong:** Middleware fails with "PrismaClient is not edge-compatible"
**Why it happens:** Prisma uses Node.js APIs not available in Edge runtime
**How to avoid:**
  - Use JWT session strategy (no DB calls needed to verify session)
  - Split auth config: edge-compatible in `auth.config.ts`, full config in `auth.ts`
  - Only import edge-compatible config in middleware
**Warning signs:** "PrismaClient is unable to run in this environment"

### Pitfall 4: Tenant Context Not Set for Couple Operations

**What goes wrong:** Couple's queries return empty results or wrong tenant's data
**Why it happens:** Forgot to wrap database calls in `withTenantContext()`
**How to avoid:**
  - Always use `withTenantContext(session.user.tenantId, ...)` for couple operations
  - Create a helper that extracts tenantId from session and wraps automatically
  - Admin operations bypass tenant context (they need to see all data)
**Warning signs:** Empty dashboards, "Cannot read property of null" errors

### Pitfall 5: Admin Can't Access Tenant-Scoped Data

**What goes wrong:** Admin queries return no results because RLS/tenant extension filters them out
**Why it happens:** Phase 1's Prisma extension adds tenant filter, but admin has no tenantId
**How to avoid:**
  - Admin operations should NOT use `withTenantContext()`
  - Create separate admin query helpers that bypass tenant scoping
  - Or check role before applying tenant filter in Prisma extension
**Warning signs:** Admin dashboard shows 0 weddings when weddings exist

### Pitfall 6: Session Cookie Too Large

**What goes wrong:** Authentication fails, "431 Request Header Fields Too Large"
**Why it happens:** Adding too much data to JWT increases cookie size
**How to avoid:**
  - Only store essential data in JWT (id, role, tenantId)
  - Fetch additional user data from database when needed
  - Don't store entire user object in session
**Warning signs:** Intermittent auth failures, cookie errors in browser console

## Code Examples

Verified patterns from official sources:

### Prisma Schema for Users with Roles

```prisma
// prisma/schema.prisma (additions to existing schema)
// Source: Auth.js Prisma adapter documentation

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  hashedPassword String?
  name           String?
  role           String    @default("couple") // "admin" or "couple"
  tenantId       String?   @unique
  tenant         Tenant?   @relation(fields: [tenantId], references: [id])

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Auth.js adapter fields (for future OAuth)
  emailVerified  DateTime?
  image          String?
  accounts       Account[]
  sessions       Session[]
}

// Required by Auth.js Prisma adapter
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Password Hashing Utility

```typescript
// src/lib/auth/password.ts
// Source: bcryptjs documentation + Next.js best practices
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12 // Higher = more secure but slower

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

### Auth API Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
// Source: Auth.js Next.js documentation
import { handlers } from "@/lib/auth/auth"

export const { GET, POST } = handlers
```

### Login Page with Server Action

```typescript
// src/app/(auth)/login/page.tsx
import { signIn } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server"

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    })

    if (result?.error) {
      // Handle error (would use useFormState in real implementation)
      return
    }

    redirect("/dashboard")
  }

  return (
    <form action={login} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Sign In
      </button>
    </form>
  )
}
```

### Middleware for Route Protection

```typescript
// src/middleware.ts (update existing)
// Source: Auth.js middleware documentation
import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "admin"

  // Admin routes require admin role
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl.origin))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
    }
  }

  // Dashboard routes require login
  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl.origin))
    }
  }

  // Auth pages redirect if already logged in
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    const redirectTo = isAdmin ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectTo, nextUrl.origin))
  }

  // Handle subdomain routing (existing Phase 1 logic)
  const hostname = req.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  let subdomain: string | null = null
  if (hostname.endsWith(`.${rootDomain}`) && !hostname.startsWith("www.")) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
  }
  if (hostname.includes("localhost") && hostname !== "localhost:3000") {
    subdomain = hostname.split(".")[0]
  }

  if (subdomain) {
    return NextResponse.rewrite(new URL(`/${subdomain}${nextUrl.pathname}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
```

### Admin: Create Wedding Site with Couple Account

```typescript
// src/app/(platform)/admin/weddings/new/actions.ts
"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { redirect } from "next/navigation"
import { z } from "zod"

const createWeddingSchema = z.object({
  subdomain: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  partner1Name: z.string().min(1),
  partner2Name: z.string().min(1),
  coupleEmail: z.string().email(),
  couplePassword: z.string().min(8),
})

export async function createWeddingSite(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const data = createWeddingSchema.parse({
    subdomain: formData.get("subdomain"),
    partner1Name: formData.get("partner1Name"),
    partner2Name: formData.get("partner2Name"),
    coupleEmail: formData.get("coupleEmail"),
    couplePassword: formData.get("couplePassword"),
  })

  // Create tenant, wedding, and user in transaction
  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        subdomain: data.subdomain,
        name: `${data.partner1Name} & ${data.partner2Name}`,
      },
    })

    await tx.wedding.create({
      data: {
        tenantId: tenant.id,
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
      },
    })

    await tx.user.create({
      data: {
        email: data.coupleEmail,
        hashedPassword: await hashPassword(data.couplePassword),
        name: `${data.partner1Name} & ${data.partner2Name}`,
        role: "couple",
        tenantId: tenant.id,
      },
    })
  })

  redirect("/admin/weddings")
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth v4 | Auth.js v5 | 2024 | Universal `auth()`, better App Router support |
| Database sessions | JWT sessions | Edge runtime | No DB calls in middleware, edge-compatible |
| Pages Router auth | App Router auth | Next.js 13+ | Server Components, Server Actions |
| Lucia Auth | Auth.js v5 | March 2025 | Lucia deprecated, Auth.js is maintained |
| bcrypt | bcryptjs | Edge runtime | Pure JS works everywhere |
| Cookie session | JWT in cookie | Security | Signed, encrypted, tamper-proof |

**Deprecated/outdated:**
- `getServerSideProps` for auth: Use `auth()` in Server Components
- `next-auth` package v4: Use v5 beta for App Router
- Lucia Auth: Deprecated March 2025, use Auth.js
- Session in localStorage: Security risk, use HTTP-only cookies
- Middleware-only auth: Always add server-side verification (CVE-2025-29927)

## Open Questions

Things that couldn't be fully resolved:

1. **Admin seeding strategy**
   - What we know: Need at least one admin account to bootstrap
   - What's unclear: Best approach for initial admin creation
   - Recommendation: Create a seed script with env var for initial admin email/password

2. **Forgot password flow**
   - What we know: Auth.js supports email provider for magic links
   - What's unclear: Whether to implement in Phase 2 or defer
   - Recommendation: Defer to later phase; admin can reset passwords for couples

3. **Session invalidation on password change**
   - What we know: JWT strategy doesn't support immediate invalidation
   - What's unclear: If this is a requirement for wedding platform
   - Recommendation: Use short JWT expiry (1 day) and accept limitation

## Sources

### Primary (HIGH confidence)

- [Auth.js Getting Started](https://authjs.dev/getting-started) - Official documentation
- [Auth.js Credentials Provider](https://authjs.dev/getting-started/authentication/credentials) - Credentials setup
- [Auth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma) - Database adapter
- [Auth.js RBAC Guide](https://authjs.dev/guides/role-based-access-control) - Role-based access
- [Auth.js TypeScript](https://authjs.dev/getting-started/typescript) - Type augmentation
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) - Route protection

### Secondary (MEDIUM confidence)

- [Building Role-Based Authentication with Next.js and Prisma](https://blog.lama.dev/role-based-auth-prisma-next-auth/) - RBAC implementation pattern
- [Next.js Authentication: The Complete 2025 Guide](https://getnextkit.com/blog/next-js-authentication-the-complete-2025-guide-with-code) - Best practices
- [CVE-2025-29927 Analysis](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/) - Security vulnerability details

### Tertiary (LOW confidence)

- WebSearch results for "bcrypt vs bcryptjs" - Community consensus on Edge compatibility
- WebSearch results for "TanStack Table shadcn/ui" - Admin dashboard patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Auth.js v5 is official Next.js auth solution
- Authentication flow: HIGH - Well-documented in Auth.js
- RBAC implementation: HIGH - Official Auth.js RBAC guide
- Prisma integration: HIGH - Official adapter with documentation
- Edge compatibility: MEDIUM - Some nuances around config splitting
- Admin dashboard: MEDIUM - Using community patterns, not official

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (Auth.js v5 is stabilizing, patterns well-established)
