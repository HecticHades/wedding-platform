# Phase 10: Custom Domains & Polish - Research

**Researched:** 2026-01-17
**Domain:** Custom domain management, DNS verification, SSL provisioning on Vercel
**Confidence:** HIGH

## Summary

Phase 10 implements custom domain support allowing couples to use their own domain (e.g., `aliceandbobwedding.com`) for their wedding site. The implementation leverages Vercel's Domains API to programmatically add, verify, and manage custom domains with automatic SSL certificate provisioning.

The platform already has multi-tenant subdomain routing via `proxy.ts` and a `customDomain` field on the Tenant model. This phase extends the routing logic to handle custom domains alongside subdomains and builds the couple-facing domain configuration UI.

**Primary recommendation:** Use `@vercel/sdk` for programmatic domain management with a verification status state machine (pending, verifying, verified, failed) and provide clear DNS instructions with real-time verification status updates.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vercel/sdk | ^1.18.7 | Programmatic Vercel API access | Official TypeScript SDK with type-safe domain management |
| Next.js Middleware | 16.x | Request routing | Already in use via proxy.ts for subdomain routing |
| Prisma | 6.x | Domain configuration storage | Already in use for tenant data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.x | Domain validation | Validate domain format before API calls |
| dns/promises | Node built-in | DNS record checking | Optional client-side verification hints |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vercel/sdk | Direct REST API calls | SDK provides type safety and better DX, but adds ~58MB dependency |
| Vercel Domains | Cloudflare for SaaS | Cloudflare offers more control but requires separate infrastructure |

**Installation:**
```bash
npm install @vercel/sdk
```

**Note:** @vercel/sdk is ESM-only. For CommonJS projects, use dynamic import: `await import("@vercel/sdk")`.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── domains/
│       ├── vercel-client.ts      # Vercel SDK singleton
│       ├── domain-service.ts     # Domain management business logic
│       ├── domain-verification.ts # Verification status management
│       └── dns-instructions.ts   # DNS instruction generation
├── app/
│   └── api/
│       └── domains/
│           ├── add/route.ts      # POST: Add custom domain
│           ├── verify/route.ts   # POST: Trigger verification
│           ├── status/route.ts   # GET: Check domain status
│           └── remove/route.ts   # DELETE: Remove domain
└── components/
    └── domains/
        ├── DomainConfigForm.tsx  # Domain input and validation
        ├── DnsInstructions.tsx   # DNS setup instructions display
        └── VerificationStatus.tsx # Real-time status indicator
```

### Pattern 1: Domain Configuration Flow
**What:** Three-step flow for custom domain setup
**When to use:** Always for custom domain configuration

```typescript
// Step 1: Couple enters domain
// Step 2: System adds domain to Vercel, returns verification requirements
// Step 3: Couple configures DNS, system verifies and provisions SSL

// src/lib/domains/domain-service.ts
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_API_TOKEN,
});

export async function addCustomDomain(
  tenantId: string,
  domain: string
): Promise<DomainAddResult> {
  // 1. Add domain to Vercel project
  const result = await vercel.projects.addProjectDomain({
    idOrName: process.env.VERCEL_PROJECT_ID!,
    teamId: process.env.VERCEL_TEAM_ID,
    requestBody: {
      name: domain,
    },
  });

  // 2. Store in database with pending status
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      customDomain: domain,
      domainStatus: "PENDING",
      domainVerification: result.verification ?? null,
    },
  });

  return {
    verified: result.verified,
    verification: result.verification,
  };
}
```

### Pattern 2: Middleware Custom Domain Routing
**What:** Extend proxy.ts to handle both subdomains and custom domains
**When to use:** For all incoming requests

```typescript
// Extended proxy.ts pattern
export default auth(async (req) => {
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Check if this is a custom domain (not subdomain of root)
  const isCustomDomain = !hostname.endsWith(`.${rootDomain}`) &&
                         hostname !== rootDomain &&
                         !hostname.includes("localhost");

  if (isCustomDomain) {
    // Lookup tenant by custom domain
    // Note: This lookup happens in Edge - see Edge Runtime section
    const tenant = await lookupTenantByCustomDomain(hostname);
    if (tenant) {
      return NextResponse.rewrite(
        new URL(`/${tenant.subdomain}${req.nextUrl.pathname}`, req.url)
      );
    }
    // Custom domain not found - show error or redirect
    return NextResponse.redirect(new URL("/domain-not-found", rootDomain));
  }

  // Existing subdomain logic...
});
```

### Pattern 3: Domain Verification Status Machine
**What:** Track domain verification through states
**When to use:** For all domain configuration workflows

```typescript
// Domain status enum
enum DomainStatus {
  PENDING = "PENDING",       // Domain added, awaiting DNS config
  VERIFYING = "VERIFYING",   // DNS configured, verification in progress
  VERIFIED = "VERIFIED",     // Domain verified, SSL provisioned
  FAILED = "FAILED",         // Verification failed
}

// Verification flow
async function checkAndUpdateDomainStatus(tenantId: string): Promise<DomainStatus> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant?.customDomain) return DomainStatus.PENDING;

  const [domainInfo, verifyResult] = await Promise.all([
    vercel.projects.getProjectDomain({
      idOrName: process.env.VERCEL_PROJECT_ID!,
      domain: tenant.customDomain,
      teamId: process.env.VERCEL_TEAM_ID,
    }),
    vercel.projects.verifyProjectDomain({
      idOrName: process.env.VERCEL_PROJECT_ID!,
      domain: tenant.customDomain,
      teamId: process.env.VERCEL_TEAM_ID,
    }),
  ]);

  const newStatus = verifyResult.verified
    ? DomainStatus.VERIFIED
    : DomainStatus.VERIFYING;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { domainStatus: newStatus },
  });

  return newStatus;
}
```

### Anti-Patterns to Avoid
- **Polling in middleware:** Never poll Vercel API in middleware - it runs on every request
- **Storing SSL certs:** Vercel handles SSL automatically - don't try to manage certificates
- **Skipping domain validation:** Always validate domain format before API calls
- **Exposing Vercel token client-side:** Keep VERCEL_API_TOKEN server-side only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSL certificates | Manual cert management | Vercel automatic SSL | Let's Encrypt integration is complex, Vercel handles automatically |
| DNS verification | Custom DNS checking | Vercel verification API | Vercel handles DNS propagation delays and retry logic |
| Domain validation | Regex patterns | Standard URL validation + Vercel API | Vercel will reject invalid domains anyway |
| Wildcard domains | Per-subdomain SSL | Vercel wildcard support | Requires Vercel nameservers, automatic handling |

**Key insight:** Vercel's platform handles the complex parts (SSL provisioning, DNS verification, certificate renewal). Focus on the UX and data model.

## Common Pitfalls

### Pitfall 1: Edge Runtime Database Access
**What goes wrong:** Prisma Client cannot make database queries in Edge Runtime (middleware runs on Edge)
**Why it happens:** Edge Runtime doesn't support TCP connections required for database access
**How to avoid:** Two options:
  1. Use an API route for domain lookup (fetch from middleware to API)
  2. Use Edge-compatible database (Vercel Postgres with @prisma/adapter-neon)
**Warning signs:** Error "PrismaClient is not configured to run in Vercel Edge Functions or Edge Middleware"

```typescript
// Option 1: API route approach
// middleware.ts
if (isCustomDomain) {
  const response = await fetch(`${req.nextUrl.origin}/api/internal/tenant-lookup?domain=${hostname}`);
  const tenant = await response.json();
  // ...
}

// Option 2: Edge-compatible (if using Vercel Postgres)
// Requires @prisma/adapter-neon and serverless driver
```

### Pitfall 2: DNS Propagation Delays
**What goes wrong:** Domain shows "not verified" even after correct DNS setup
**Why it happens:** DNS propagation takes 1-48 hours globally
**How to avoid:**
  - Show clear messaging about propagation time
  - Add "Check Again" button with rate limiting
  - Consider background verification job
**Warning signs:** Users complaining verification never completes

### Pitfall 3: Domain Already Used on Vercel
**What goes wrong:** Adding domain fails with ownership verification required
**Why it happens:** Domain was previously used on another Vercel project
**How to avoid:**
  - Handle TXT verification challenge in addition to CNAME
  - Provide clear instructions for TXT record
  - Support both apex and subdomain configurations
**Warning signs:** API returns `verified: false` with TXT verification challenge

### Pitfall 4: Apex Domain vs Subdomain Confusion
**What goes wrong:** Wrong DNS instructions given to user
**Why it happens:** Apex domains (example.com) need A record; subdomains (www.example.com) need CNAME
**How to avoid:** Detect domain type and provide appropriate instructions
**Warning signs:** "DNS configuration incorrect" errors

```typescript
function getDnsInstructions(domain: string): DnsInstructions {
  const isApex = !domain.includes(".") || domain.split(".").length === 2;

  if (isApex) {
    return {
      recordType: "A",
      name: "@",
      value: "76.76.21.21", // Vercel's IP
      instructions: "Add an A record pointing to Vercel's IP address",
    };
  } else {
    return {
      recordType: "CNAME",
      name: domain.split(".")[0],
      value: "cname.vercel-dns.com",
      instructions: "Add a CNAME record pointing to Vercel",
    };
  }
}
```

### Pitfall 5: Rate Limiting
**What goes wrong:** API calls fail with rate limit errors
**Why it happens:** Vercel has rate limits on domain operations
**How to avoid:**
  - Cache domain status, don't check on every request
  - Implement exponential backoff for verification polling
  - Rate limit user-triggered verification checks
**Warning signs:** 429 errors from Vercel API

**Relevant rate limits from Vercel:**
- Project domain creation/update/remove: 100/minute
- Project domain verification: 100/minute
- Project domains get: 500/minute

## Code Examples

Verified patterns from official sources:

### Adding a Domain to Project
```typescript
// Source: @vercel/sdk documentation
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_API_TOKEN,
});

async function addDomain(domain: string) {
  const result = await vercel.projects.addProjectDomain({
    idOrName: process.env.VERCEL_PROJECT_ID!,
    teamId: process.env.VERCEL_TEAM_ID,
    requestBody: {
      name: domain,
    },
  });

  // Result includes:
  // - verified: boolean
  // - verification: array of verification challenges if not verified
  // - name: domain name
  return result;
}
```

### Verifying a Domain
```typescript
// Source: @vercel/sdk documentation
async function verifyDomain(domain: string) {
  const result = await vercel.projects.verifyProjectDomain({
    idOrName: process.env.VERCEL_PROJECT_ID!,
    domain: domain,
    teamId: process.env.VERCEL_TEAM_ID,
  });

  return result.verified;
}
```

### Getting Domain Status
```typescript
// Source: @vercel/sdk documentation
async function getDomainStatus(domain: string) {
  const result = await vercel.projects.getProjectDomain({
    idOrName: process.env.VERCEL_PROJECT_ID!,
    domain: domain,
    teamId: process.env.VERCEL_TEAM_ID,
  });

  return {
    verified: result.verified,
    verification: result.verification,
  };
}
```

### Removing a Domain
```typescript
// Source: @vercel/sdk documentation
async function removeDomain(domain: string) {
  await vercel.projects.removeProjectDomain({
    idOrName: process.env.VERCEL_PROJECT_ID!,
    domain: domain,
    teamId: process.env.VERCEL_TEAM_ID,
  });
}
```

### DNS Instructions Component Pattern
```typescript
// UX pattern from SaaS best practices
interface DnsInstructionsProps {
  domain: string;
  verification?: {
    type: string;
    domain: string;
    value: string;
  }[];
}

function DnsInstructions({ domain, verification }: DnsInstructionsProps) {
  const isApex = domain.split(".").length === 2;

  return (
    <div className="space-y-4">
      <h3>DNS Configuration Required</h3>

      {/* Primary record */}
      <div className="bg-gray-50 p-4 rounded">
        <p className="font-mono text-sm">
          {isApex ? (
            <>
              Type: A<br />
              Name: @<br />
              Value: 76.76.21.21
            </>
          ) : (
            <>
              Type: CNAME<br />
              Name: {domain.split(".")[0]}<br />
              Value: cname.vercel-dns.com
            </>
          )}
        </p>
      </div>

      {/* TXT verification if required */}
      {verification?.find(v => v.type === "TXT") && (
        <div className="bg-yellow-50 p-4 rounded">
          <p className="text-sm text-yellow-800">
            Additional verification required (domain previously used):
          </p>
          <p className="font-mono text-sm mt-2">
            Type: TXT<br />
            Name: _vercel<br />
            Value: {verification.find(v => v.type === "TXT")?.value}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Database Schema Extension

The Tenant model needs additional fields for domain management:

```prisma
// Addition to existing Tenant model
model Tenant {
  id           String    @id @default(cuid())
  subdomain    String    @unique
  customDomain String?   @unique
  name         String

  // New fields for domain management
  domainStatus       DomainStatus @default(NONE)
  domainVerification Json?        // Store verification challenges
  domainAddedAt      DateTime?    // When domain was added
  domainVerifiedAt   DateTime?    // When domain was verified

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  wedding      Wedding?
  user         User?
}

enum DomainStatus {
  NONE       // No custom domain configured
  PENDING    // Domain added, awaiting DNS configuration
  VERIFYING  // DNS configured, verification in progress
  VERIFIED   // Domain verified and active
  FAILED     // Verification failed
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual SSL with Let's Encrypt | Automatic SSL via Vercel | 2020+ | No certificate management needed |
| Direct REST API calls | @vercel/sdk TypeScript SDK | 2024 | Type-safe, better DX |
| Polling for verification | Webhook + polling hybrid | 2024+ | Better UX, less API calls |

**Deprecated/outdated:**
- Manual certificate management: Vercel handles automatically
- Vercel CLI for domain management: Use SDK/API for programmatic access

## Vercel Limits Reference

| Limit | Hobby | Pro | Enterprise |
|-------|-------|-----|------------|
| Domains per Project | 50 | Unlimited* | Unlimited* |
| Domain creation/update/remove | 100/minute | 100/minute | 100/minute |
| Domain verification | 100/minute | 100/minute | 100/minute |

*Soft limits: 100,000 (Pro), 1,000,000 (Enterprise) - can be increased on request.

**Important:** Free/Hobby accounts have a hard limit of 50 domains per project. For a SaaS with many customers wanting custom domains, Pro plan is required.

## Open Questions

Things that couldn't be fully resolved:

1. **Edge Runtime Database Access Strategy**
   - What we know: Prisma can't query in Edge middleware; need workaround
   - What's unclear: Performance impact of API fetch in middleware vs Edge-compatible adapter
   - Recommendation: Start with API fetch approach (simpler); optimize to Edge adapter if latency is an issue

2. **Background Verification vs On-Demand**
   - What we know: DNS propagation takes time; user may check frequently
   - What's unclear: Optimal polling interval; whether to use cron job
   - Recommendation: On-demand with rate limiting (1 check per minute); cache result for 5 minutes

3. **Domain Transfer Between Tenants**
   - What we know: Vercel allows moving domains between projects
   - What's unclear: Should platform support transferring domains between weddings?
   - Recommendation: Require domain removal before re-adding to different tenant

## Sources

### Primary (HIGH confidence)
- Vercel REST API Documentation - Domain management endpoints
- @vercel/sdk GitHub - TypeScript SDK documentation
- Vercel Limits Documentation - Rate limits and plan limits
- Prisma Edge Deployment Guide - Edge runtime compatibility

### Secondary (MEDIUM confidence)
- Vercel Platforms Starter Kit - Middleware patterns for multi-tenant
- SaaS Custom Domains Guide - UX patterns for domain configuration

### Tertiary (LOW confidence)
- Community discussions on DNS propagation timing
- Blog posts on custom domain implementation patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Vercel SDK with comprehensive documentation
- Architecture: HIGH - Based on Vercel's own multi-tenant patterns and existing project structure
- Pitfalls: MEDIUM - Edge runtime limitations well-documented; some UX patterns from community
- Database schema: HIGH - Follows existing project patterns

**Research date:** 2026-01-17
**Valid until:** ~60 days (Vercel SDK is beta but stable; domain APIs are mature)
