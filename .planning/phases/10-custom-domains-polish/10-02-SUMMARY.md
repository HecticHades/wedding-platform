---
phase: 10
plan: 02
subsystem: custom-domains
tags: [api, domain-routing, middleware, authentication]

dependency_graph:
  requires: [10-01-domain-infrastructure]
  provides: [domain-api-routes, tenant-lookup-api, custom-domain-routing]
  affects: [10-03-domain-ui]

tech_stack:
  added: []
  patterns:
    - "Internal API for Edge middleware database access"
    - "Authenticated domain management endpoints"
    - "Hostname-based routing with fallback"

key_files:
  created:
    - src/app/api/domains/add/route.ts
    - src/app/api/domains/verify/route.ts
    - src/app/api/domains/remove/route.ts
    - src/app/api/domains/status/route.ts
    - src/app/api/internal/tenant-lookup/route.ts
  modified:
    - src/proxy.ts

decisions:
  - id: internal-api-for-edge
    choice: "Internal API endpoint for Prisma in Edge middleware"
    rationale: "Edge runtime cannot import Prisma directly; fetch to internal API is recommended pattern"
  - id: matcher-excludes-internal
    choice: "Matcher excludes api/internal routes"
    rationale: "Prevents recursive middleware calls when tenant-lookup fetches itself"

metrics:
  duration: 3 min
  completed: 2026-01-17
---

# Phase 10 Plan 02: Domain API Routes Summary

**One-liner:** Authenticated API routes for domain CRUD operations plus internal tenant-lookup enabling Edge middleware to route custom domains to correct tenants.

## What Was Built

### Domain Management API

Four authenticated endpoints for couples to manage their custom domains:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/domains/add` | POST | Add custom domain with validation |
| `/api/domains/verify` | POST | Trigger DNS verification |
| `/api/domains/remove` | DELETE | Remove custom domain |
| `/api/domains/status` | GET | Get current domain status |

All routes:
- Require authenticated session with `tenantId`
- Return proper error codes (401, 400, 500)
- Use domain service from 10-01 for business logic

### Internal Tenant Lookup API

`/api/internal/tenant-lookup` provides Edge middleware access to database:
- Called by proxy.ts when custom domain detected
- Only returns tenant if domain is VERIFIED
- Bypasses Edge runtime Prisma limitations

### Extended Proxy Middleware

proxy.ts now handles three routing scenarios:

1. **Subdomain routing** (existing): `alice-bob.example.com` -> `/${subdomain}${path}`
2. **Custom domain routing** (new): `ourwedding.com` -> fetch tenant -> rewrite to subdomain
3. **Root domain**: Falls through to Next.js app

Custom domain detection logic:
```typescript
const isCustomDomain =
  !hostname.endsWith(`.${rootDomain}`) &&
  hostname !== rootDomain &&
  !hostname.includes("localhost") &&
  !hostname.startsWith("www.")
```

## Technical Decisions

### Internal API for Edge Middleware

Edge runtime cannot use Prisma directly. Solution:
- Create `/api/internal/tenant-lookup` as Node.js runtime endpoint
- Middleware fetches this API to resolve custom domains
- Matcher updated to `|api/internal` to prevent recursive middleware invocation

### Domain Validation Schema

```typescript
const addDomainSchema = z.object({
  domain: z
    .string()
    .min(4)
    .max(253)
    .regex(
      /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid domain format"
    ),
})
```

Validates: length, format, no leading hyphens, valid TLD.

## Commits

| Commit | Description |
|--------|-------------|
| `eadb377` | Create domain management API routes (add/verify/remove/status) |
| `ca3b6b3` | Add tenant lookup API and custom domain routing |

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] All four domain API routes exist with correct HTTP method handlers
- [x] Internal tenant-lookup API created
- [x] proxy.ts contains `isCustomDomain` logic
- [x] proxy.ts fetches `/api/internal/tenant-lookup`
- [x] Matcher excludes `api/internal`

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

### Ready for 10-03 (Domain Management UI)

- API routes ready for UI integration
- Domain status endpoint returns all needed data for display
- DNS instructions available for user guidance

### Integration Points

- UI calls `/api/domains/add` with domain string
- UI polls `/api/domains/status` for verification progress
- UI calls `/api/domains/verify` to trigger re-verification
- UI calls `/api/domains/remove` to remove domain
