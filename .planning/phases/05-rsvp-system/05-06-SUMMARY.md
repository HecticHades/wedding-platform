---
phase: 05-rsvp-system
plan: 06
subsystem: admin
tags: [admin, rsvp, dashboard, platform-overview]
requires:
  - 05-04 (RSVP dashboard provides data patterns)
provides:
  - Admin cross-wedding RSVP overview
  - Platform-wide RSVP statistics
  - Wedding RSVP comparison table
affects:
  - Future admin features may extend this pattern
tech-stack:
  added: []
  patterns:
    - Admin queries without tenant context
    - Sortable table with client-side filtering
    - Summary cards with platform-wide aggregation
key-files:
  created:
    - src/app/(platform)/admin/rsvp/page.tsx
    - src/app/(platform)/admin/rsvp/actions.ts
    - src/components/admin/AdminRsvpOverview.tsx
  modified:
    - src/app/(platform)/admin/page.tsx
decisions:
  - decision: "No tenant context for admin queries"
    rationale: "Admin needs platform-wide visibility across all weddings"
  - decision: "Client-side sorting and filtering"
    rationale: "Typically small number of weddings; instant UX"
  - decision: "Color-coded response rate progress bars"
    rationale: "Quick visual identification of weddings needing attention"
metrics:
  duration: 4 min
  completed: 2026-01-17
---

# Phase 5 Plan 6: Admin RSVP Overview Summary

Admin cross-wedding RSVP view with platform-wide stats, sortable wedding table, and response rate visualization.

## One-liner

Admin RSVP overview showing all weddings with aggregated stats, sortable table, and color-coded response rates.

## Commits

| Hash | Message |
|------|---------|
| a411a7a | feat(05-06): create admin RSVP server actions |
| f142442 | feat(05-06): create admin RSVP overview component |
| 44b4dec | feat(05-06): create admin RSVP overview page |

## What Was Built

### 1. Admin RSVP Server Actions (src/app/(platform)/admin/rsvp/actions.ts)
- `getAdminRsvpOverview()`: Fetches all weddings with aggregated RSVP data
- Returns AdminWeddingRsvpSummary with: weddingId, subdomain, coupleNames, weddingDate, hasRsvpCode, totalGuests, totalInvitations, responded, attending, declined, responseRate
- Direct Prisma queries without withTenantContext (admin sees all)
- Sorted by wedding date (upcoming first), then by response rate

### 2. AdminRsvpOverview Component (src/components/admin/AdminRsvpOverview.tsx)
- Summary row: Total weddings, total guests, total responses, avg response rate
- Search filter by couple name or subdomain
- Sortable columns (click header to toggle asc/desc)
- Table columns: Subdomain (link), Couple Names, Wedding Date, Guests, Invitations, Responded (attending/declined/pending), Response Rate (progress bar), RSVP Code Status (badge)
- Color-coded response rate: green (>80%), yellow (50-80%), red (<50%)
- View Details link to /admin/weddings/[id]

### 3. Admin RSVP Page (src/app/(platform)/admin/rsvp/page.tsx)
- Server component with admin role check
- Breadcrumb: Admin > RSVP Overview
- Platform-wide summary cards: Weddings with RSVPs, Total Guests Invited, Total Responses, Average Response Rate
- Renders AdminRsvpOverview table
- Empty state when no weddings have guests

### 4. Admin Dashboard Update (src/app/(platform)/admin/page.tsx)
- Added RSVP Overview card with link to /admin/rsvp

## Technical Decisions

1. **No tenant context for admin**: Admin queries use direct Prisma access to see all platform data
2. **Client-side sorting/filtering**: Wedding count typically manageable; instant UX without server round-trips
3. **Color-coded progress bars**: Quick visual identification - red needs attention, green on track

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] /admin/rsvp page requires admin role (redirect if not)
- [x] Page shows all weddings (not filtered by tenant)
- [x] Each wedding shows guest count, response count, rate
- [x] Response rate has visual indicator (progress bar)
- [x] Weddings can be sorted and filtered
- [x] Links work to view individual wedding details

## Files Changed

| File | Lines | Purpose |
|------|-------|---------|
| src/app/(platform)/admin/rsvp/actions.ts | 103 | Admin RSVP data queries |
| src/components/admin/AdminRsvpOverview.tsx | 276 | Sortable RSVP table component |
| src/app/(platform)/admin/rsvp/page.tsx | 116 | Admin RSVP overview page |
| src/app/(platform)/admin/page.tsx | +12 | RSVP Overview link |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 5 complete. The RSVP system is fully implemented:
- Guest authentication via RSVP code (05-02)
- RSVP form with multi-event support (05-03)
- Couple dashboard with stats and meal options (05-04)
- Email notifications infrastructure (05-05)
- Admin cross-wedding overview (05-06)
