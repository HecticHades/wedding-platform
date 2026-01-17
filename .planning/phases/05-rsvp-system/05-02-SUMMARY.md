---
phase: 05-rsvp-system
plan: 02
subsystem: rsvp-authentication
tags: [rsvp, guest-lookup, cookie-auth, server-actions]

dependency-graph:
  requires: [05-01]
  provides: [RSVP code validation, Guest name search, RSVP entry page]
  affects: [05-03]

tech-stack:
  added: []
  patterns: [cookie-based-auth, debounced-search, server-actions]

key-files:
  created:
    - src/app/[domain]/rsvp/actions.ts
    - src/app/[domain]/rsvp/page.tsx
    - src/app/[domain]/rsvp/RsvpPageClient.tsx
    - src/components/rsvp/RsvpCodeEntry.tsx
    - src/components/rsvp/GuestLookup.tsx
  modified: []

decisions:
  - id: "05-02-001"
    choice: "httpOnly cookie for RSVP auth"
    rationale: "Secure guest session without exposing code in client storage"
  - id: "05-02-002"
    choice: "Debounced search with 300ms delay"
    rationale: "Reduces server load while maintaining responsive UX"

metrics:
  duration: 8 min
  completed: 2026-01-17
---

# Phase 05 Plan 02: RSVP Guest Authentication Summary

**One-liner:** RSVP entry flow with code validation, httpOnly cookie auth, and debounced guest name search for guest identification.

## What Was Built

### Server Actions (src/app/[domain]/rsvp/actions.ts)

**validateRsvpCode(weddingId, code):**
- Validates RSVP code against wedding record
- Sets httpOnly cookie `rsvp_auth_{weddingId}` on success
- Cookie settings: httpOnly, secure in prod, sameSite: lax, 30-day expiry
- Returns `{ valid: boolean, error?: string }`

**searchGuests(weddingId, searchName):**
- Case-insensitive name search using Prisma `contains` with `mode: "insensitive"`
- Returns up to 10 matching guests with id, name, partyName
- Requires minimum 2 characters for search

**getWeddingByDomain(domain):**
- Looks up tenant by subdomain
- Returns wedding with rsvpCode, partner names, and date
- Used by RSVP page to determine auth flow

### Components

**RsvpCodeEntry (src/components/rsvp/RsvpCodeEntry.tsx):**
- Client component with useTransition for loading state
- Form with RSVP code input
- Error display for invalid codes
- Calls validateRsvpCode server action
- On success, calls onSuccess callback and router.refresh()
- Wedding-themed styling with Tailwind

**GuestLookup (src/components/rsvp/GuestLookup.tsx):**
- Client component with debounced search (300ms)
- Displays matching guests as clickable cards
- Shows partyName if available
- Redirects to /rsvp/{guestId} on selection
- "No guests found" message for empty results
- Helpful text prompts throughout

### RSVP Page (src/app/[domain]/rsvp/)

**page.tsx (Server Component):**
- Async page fetching wedding via getWeddingByDomain
- Checks for existing RSVP auth cookie
- Renders wedding header with couple names and date
- Passes auth state to RsvpPageClient
- Uses wedding theme CSS variables

**RsvpPageClient.tsx:**
- Client wrapper managing auth state
- Shows RsvpCodeEntry when code required and not authenticated
- Shows GuestLookup when authenticated or no code required
- Handles state transition after successful code entry

## Technical Decisions

1. **httpOnly cookie authentication** - RSVP code stored server-side in httpOnly cookie prevents XSS attacks and client-side tampering while maintaining guest session across page loads.

2. **300ms debounced search** - Balances responsiveness with server load. Starts searching after 2 characters minimum.

3. **Direct Prisma queries (no tenant context)** - Guest-facing RSVP pages don't use withTenantContext since wedding lookup happens via public subdomain.

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

| File | Changes |
|------|---------|
| `src/app/[domain]/rsvp/actions.ts` | +118 lines - Server actions for RSVP auth (new) |
| `src/components/rsvp/RsvpCodeEntry.tsx` | +110 lines - Code entry form (new) |
| `src/components/rsvp/GuestLookup.tsx` | +171 lines - Guest search component (new) |
| `src/app/[domain]/rsvp/page.tsx` | +90 lines - RSVP entry page (new) |
| `src/app/[domain]/rsvp/RsvpPageClient.tsx` | +33 lines - Client state wrapper (new) |

## Verification Results

| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| validateRsvpCode exported | Pass |
| searchGuests exported | Pass |
| getWeddingByDomain exported | Pass |
| RsvpCodeEntry >= 40 lines | Pass (110 lines) |
| GuestLookup >= 50 lines | Pass (171 lines) |
| page.tsx >= 30 lines | Pass (90 lines) |
| Key link: page -> RsvpCodeEntry/GuestLookup | Pass |
| Key link: RsvpCodeEntry -> validateRsvpCode | Pass |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5a1a156 | feat | Create RSVP server actions |
| cfbbc09 | feat | Create RSVP code entry and guest lookup components |
| c91c143 | feat | Create RSVP entry page with auth flow |

## Next Phase Readiness

**Ready for 05-03 (RSVP Form UI):**
- Guest can navigate to /rsvp and authenticate
- Guest can search for their name and find their record
- Guest redirected to /rsvp/{guestId} for RSVP submission
- Cookie auth persists guest session for form completion

**Artifacts provided:**
- `src/app/[domain]/rsvp/` - RSVP entry point
- `src/components/rsvp/RsvpCodeEntry.tsx` - Reusable code entry form
- `src/components/rsvp/GuestLookup.tsx` - Reusable guest search
- Server actions for code validation and guest lookup
