# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** Couples can easily share their wedding details with guests and manage RSVPs, gifts, and photos in one place - with minimal friction for both couples and guests.
**Current focus:** Phase 5 in progress - RSVP System

## Current Position

Phase: 5 of 10 (RSVP System) - IN PROGRESS
Plan: 4 of 6 complete (05-04)
Status: In progress
Last activity: 2026-01-17 - Completed 05-04-PLAN.md (RSVP Dashboard)

Progress: [][][][][][][][][][][][][][][][][][][][] 91% (20/22 plans through Phase 5)

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 9 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 | 33 min | 11 min |
| 02-admin-couple-auth | 3/3 | 29 min | 10 min |
| 03-content-builder | 6/6 | 52 min | 9 min |
| 04-event-guest-management | 4/4 | 30 min | 8 min |
| 05-rsvp-system | 4/6 | 28 min | 7 min |

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
| prisma-json-types-generator@3.2.3 | 03-01 | Latest 4.x requires Prisma 7.2+; 3.2.3 compatible with Prisma 6.x |
| CSS variables over Tailwind themes | 03-01 | Runtime theme switching without rebuild |
| Discriminated union for content validation | 03-01 | Better Zod error messages and TypeScript inference |
| Optimistic updates for drag-drop | 03-04 | Better UX for instant feedback with error rollback |
| Section type uniqueness (one of each) | 03-04 | Simplifies content model and prevents confusion |
| Load all 20 wedding fonts via next/font | 03-03 | Self-hosted for GDPR compliance and performance |
| Font CSS variable map | 03-03 | Bridges font names in theme settings to next/font CSS vars |
| Debounced color picker (100ms) | 03-03 | Prevents excessive re-renders during color selection |
| Three initial templates | 03-02 | Classic/Modern/Rustic cover traditional, contemporary, natural aesthetics |
| SVG thumbnails for templates | 03-02 | Lightweight (<2KB), scalable, fast-loading previews |
| Type guards in editors | 03-05 | Ensures TypeScript knows exact content type from discriminated union |
| Move buttons over drag for nested lists | 03-05 | Simpler than nested dnd-kit; section list already has drag-drop |
| Component router pattern | 03-06 | ContentSection routes by type for clean separation |
| Semantic section IDs | 03-06 | Enables anchor link navigation from header |
| db push workflow over migrations | 04-01 | Existing project uses db push; no migrations directory |
| EventGuest tenant isolation via event.wedding | 04-01 | EventGuest doesn't have direct wedding relation |
| Zod transform for empty string to null | 04-03 | Email/phone fields accept empty strings but store as null |
| Client-side search for guest list | 04-03 | Guest lists typically <500; avoids server round-trips |
| Checkbox value="true" for boolean form fields | 04-02 | HTML checkboxes only send value when checked |
| Delete confirmation modal | 04-02 | Inline overlay modal for better UX than browser confirm() |
| Client-side search for event list | 04-02 | Added when > 3 events for quick filtering |
| Bulk invitation update via transaction | 04-04 | Delete all + create new atomically; simpler than diff |
| Separate Events section from content-builder | 04-04 | Database events with access control vs. manual JSON content |
| MealOption as JSON array on Event | 05-01 | Per-event meal options allow flexibility; JSON simpler than separate table |
| Resend client with console warning | 05-01 | Warning at import time allows dev without email key configured |
| httpOnly cookie for RSVP auth | 05-02 | Secure guest session without exposing code in client storage |
| Debounced search (300ms) for guest lookup | 05-02 | Reduces server load while maintaining responsive UX |
| Per-event RSVP form pattern | 05-03 | Each event rendered as separate form allows independent submission |
| Progress indicator for multi-event response | 05-03 | Shows guests how many events they've responded to |
| Conditional form fields based on attendance | 05-03 | Only show meal/dietary/plus-one when attending - reduces cognitive load |
| Accordion for per-event stats | 05-04 | Clean way to show breakdown without overwhelming view |
| Client-side status filter for guest list | 05-04 | Guest lists typically <500; instant filtering UX |
| Move buttons for meal options reorder | 05-04 | Simpler than dnd-kit for typically short lists |

### Pending Todos

(None)

### Blockers/Concerns

- k6 load test needs to be run against deployed endpoint for full verification
- Supabase pgbouncer connection on port 6543, direct on 5432
- RESEND_API_KEY needs to be configured for email sending

## Phase 5 Progress

| Plan | Status | Description |
|------|--------|-------------|
| 05-01 | Complete | RSVP Infrastructure |
| 05-02 | Complete | RSVP Guest Authentication |
| 05-03 | Complete | RSVP Form UI |
| 05-04 | Complete | RSVP Dashboard |
| 05-05 | Pending | Email Notifications |
| 05-06 | Pending | Guest Export |

## Deployment

- **Vercel:** wedding-platform-fawn.vercel.app
- **Database:** Supabase (PostgreSQL)
- **Auth:** Auth.js v5 with JWT strategy
- **Blob Storage:** Vercel Blob (for gallery images)

## Session Continuity

Last session: 2026-01-17T12:51:52Z
Stopped at: Completed 05-04-PLAN.md (RSVP Dashboard)
Resume file: None - Continue with 05-05
