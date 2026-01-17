---
phase: 10-custom-domains-polish
plan: 01
subsystem: domain-management
tags: [vercel, domains, dns, infrastructure]

dependency_graph:
  requires:
    - 01-foundation (Tenant model, Prisma setup)
  provides:
    - DomainStatus enum for tracking domain verification
    - Vercel SDK integration for programmatic domain management
    - Domain service with add/verify/remove/status operations
    - DNS instruction generator for user guidance
  affects:
    - 10-02 (API routes will use domain service)
    - 10-03 (UI will display domain status and DNS instructions)

tech_stack:
  added:
    - "@vercel/sdk@^1.1.0"
  patterns:
    - Singleton SDK client with environment config
    - Vercel API integration for domain lifecycle
    - Database-synced domain state management

key_files:
  created:
    - src/lib/domains/vercel-client.ts
    - src/lib/domains/domain-service.ts
    - src/lib/domains/dns-instructions.ts
  modified:
    - package.json
    - prisma/schema.prisma
    - .env.example

decisions:
  - decision: "DomainStatus enum with 5 states"
    rationale: "NONE/PENDING/VERIFYING/VERIFIED/FAILED covers full domain lifecycle"
  - decision: "Domain fields on Tenant (not Wedding)"
    rationale: "Domain is tenant-level concern; subdomain already on Tenant"
  - decision: "Apex vs subdomain detection by dot count"
    rationale: "Simple heuristic: 2 parts = apex, 3+ parts = subdomain (www treated as apex)"

metrics:
  duration: "6 min"
  completed: "2026-01-17"
---

# Phase 10 Plan 01: Domain Infrastructure Summary

**One-liner:** Vercel SDK integration with domain service providing add/verify/remove operations and DNS instruction generation for apex and subdomain support.

## What Was Built

### Database Schema

Added to `prisma/schema.prisma`:

1. **DomainStatus enum** - Five states for domain verification lifecycle:
   - `NONE` - No custom domain configured
   - `PENDING` - Domain added, awaiting DNS configuration
   - `VERIFYING` - DNS configured, verification in progress
   - `VERIFIED` - Domain verified and active
   - `FAILED` - Verification failed

2. **Tenant domain fields**:
   - `domainStatus` - Current verification state
   - `domainVerification` - JSON storage for Vercel challenges
   - `domainAddedAt` - Timestamp when domain was added
   - `domainVerifiedAt` - Timestamp when domain was verified

### Domain Service Layer

Three files in `src/lib/domains/`:

1. **vercel-client.ts** - Vercel SDK singleton:
   ```typescript
   export const vercel = new Vercel({ bearerToken: process.env.VERCEL_API_TOKEN! })
   export const vercelConfig = { projectId, teamId }
   ```

2. **dns-instructions.ts** - DNS guidance generator:
   - `getDnsInstructions(domain)` - Returns A or CNAME record based on domain type
   - `getTxtVerification(verification)` - Parses TXT challenge from Vercel response
   - Apex domains: A record to 76.76.21.21 (Vercel IP)
   - Subdomains: CNAME to cname.vercel-dns.com

3. **domain-service.ts** - Business logic layer:
   - `addCustomDomain(tenantId, domain)` - Add to Vercel + DB with DNS instructions
   - `verifyDomain(tenantId)` - Trigger Vercel verification check
   - `removeDomain(tenantId)` - Remove from Vercel + clear DB fields
   - `getDomainStatus(tenantId)` - Get current state with instructions

### Environment Configuration

Added to `.env.example`:
- `VERCEL_API_TOKEN` - API token for Vercel access
- `VERCEL_PROJECT_ID` - Project identifier
- `VERCEL_TEAM_ID` - Optional team ID

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Store domainVerification as JSON | Vercel returns varying challenge structures |
| Domain normalization (lowercase, no trailing dot) | Consistent storage and comparison |
| Check existing tenant before Vercel call | Prevent duplicate domain registration |
| Optimistic DB update on add | Save domain immediately, verify async |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Added @vercel/sdk dependency |
| `prisma/schema.prisma` | Added DomainStatus enum and Tenant domain fields |
| `src/lib/domains/vercel-client.ts` | Created - Vercel SDK singleton |
| `src/lib/domains/dns-instructions.ts` | Created - DNS instruction generator |
| `src/lib/domains/domain-service.ts` | Created - Domain CRUD operations |
| `.env.example` | Added Vercel API configuration |

## Commits

| Hash | Message |
|------|---------|
| b889bdd | feat(10-01): install Vercel SDK and add domain schema |
| b1f04ce | feat(10-01): create Vercel client and domain service |
| 0cfc23d | docs(10-01): add Vercel API config to .env.example |

## Next Phase Readiness

**Ready for 10-02:** API routes can import domain service directly.

**Prerequisites for runtime:**
- VERCEL_API_TOKEN must be configured with domain scope
- VERCEL_PROJECT_ID must point to correct project
- VERCEL_TEAM_ID needed if using team account

**Testing notes:**
- Domain service requires valid Vercel credentials to test
- DNS instructions can be unit tested without API
