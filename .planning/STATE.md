# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** Couples can easily share their wedding details with guests and manage RSVPs, gifts, and photos in one place - with minimal friction for both couples and guests.
**Current focus:** Phase 3 - Content Builder

## Current Position

Phase: 3 of 10 (Content Builder)
Plan: Not started
Status: Ready to plan
Last activity: 2026-01-17 - Phase 2 verified and complete

Progress: ██░░░░░░░░ 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 10 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 | 33 min | 11 min |
| 02-admin-couple-auth | 3/3 | 29 min | 10 min |

## Accumulated Context

### Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| proxy.ts instead of middleware.ts | 01-01 | Next.js 16 deprecates middleware convention |
| wedding-platform subdirectory | 01-01 | Coexist with other projects in Claude Projects folder |
| Next.js 16.1.3 | 01-01 | Updated from 15.1.6 to patch CVE-2025-66478 |
| Wedding create requires explicit tenant relation | 01-02 | Prisma strict types prevent auto-injection |
| Tenant lookup before context, render inside context | 01-02 | Initial lookup finds tenant, context scopes subsequent ops |
| Mobile-first Tailwind pattern | 01-03 | Unprefixed = mobile, prefixed = larger breakpoints |
| Sticky header with backdrop blur | 01-03 | Modern mobile UX pattern |
| k6 staged load testing | 01-03 | Gradual ramp-up (25->50->100) for stability verification |
| JWT strategy over database sessions | 02-01 | Edge runtime compatibility required |
| Separate PrismaClient for auth | 02-01 | Auth operations are platform-level, not tenant-scoped |
| Edge-compatible auth.config.ts | 02-01 | Middleware needs config without Prisma imports |
| Server actions over API routes | 02-02 | Better DX with type-safe form handling |
| $transaction for atomic wedding creation | 02-02 | Ensure data consistency across tenant/wedding/user |
| Defense-in-depth role checks | 02-02 | CVE-2025-29927 mitigation - check role in layouts beyond middleware |
| withTenantContext for couple queries | 02-03 | Ensures data isolation - couples only see their own wedding |
| Combined auth + subdomain middleware | 02-03 | Single middleware handles both concerns efficiently |

### Pending Todos

(None)

### Blockers/Concerns

- k6 load test needs to be run against deployed endpoint for full verification
- Supabase pgbouncer connection on port 6543, direct on 5432

## Phase 2 Completion Status

All success criteria verified:

| Criteria | Status |
|----------|--------|
| Admin login and wedding list | Verified |
| Admin create wedding with couple | Verified |
| Admin view/edit wedding settings | Verified |
| Couple login to own dashboard | Verified |
| Couple data isolation | Verified |

## Deployment

- **Vercel:** wedding-platform-fawn.vercel.app
- **Database:** Supabase (PostgreSQL)
- **Auth:** Auth.js v5 with JWT strategy

## Session Continuity

Last session: 2026-01-17T01:30:00Z
Stopped at: Completed Phase 2 - Admin & Couple Authentication
Resume file: None - ready for Phase 3 planning
