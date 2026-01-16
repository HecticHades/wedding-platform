# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** Couples can easily share their wedding details with guests and manage RSVPs, gifts, and photos in one place - with minimal friction for both couples and guests.
**Current focus:** Phase 2 - Admin & Couple Authentication

## Current Position

Phase: 2 of 10 (Admin & Couple Authentication)
Plan: 1 of 4
Status: In progress
Last activity: 2026-01-17 - Completed 02-01-PLAN.md (Auth.js setup)

Progress: █████░░░░░ 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 10 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 | 33 min | 11 min |
| 02-admin-couple-auth | 1/4 | 8 min | 8 min |

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

### Pending Todos

(None)

### Blockers/Concerns

- DATABASE_URL needs to be configured before database operations work
- Local subdomain testing requires hosts file modification
- `npx prisma migrate dev` required after DATABASE_URL configured
- k6 load test needs to be run against deployed endpoint for full verification
- AUTH_SECRET environment variable required for Auth.js
- Run `npm install` to install new auth dependencies

## Phase 1 Completion Status

All success criteria verified:

| Criteria | Status |
|----------|--------|
| Subdomain routing | Verified |
| Database tenant isolation | Code complete |
| CDN cache headers | Ready (verify post-deployment) |
| 100 concurrent users | Script ready |
| Mobile responsive | Verified |

## Session Continuity

Last session: 2026-01-17T15:38:00Z
Stopped at: Completed 02-01-PLAN.md (Auth.js setup)
Resume file: None - ready for 02-02-PLAN.md
