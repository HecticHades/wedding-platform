---
phase: 05-rsvp-system
plan: 04
subsystem: rsvp-dashboard
tags: [dashboard, statistics, meal-options, couple-ui]
requires:
  - 05-03 (RSVP form UI for guest responses)
provides:
  - RSVP statistics utilities with aggregation
  - Couple-facing RSVP dashboard with stats
  - Guest response list with filtering
  - Meal options configuration per event
affects:
  - 05-05 (Email notifications may reference dashboard)
  - 05-06 (Export may use same data sources)
tech-stack:
  added: []
  patterns:
    - Accordion for per-event breakdown
    - Status filter buttons with count badges
    - Expandable rows for multi-event guests
key-files:
  created:
    - src/lib/rsvp/rsvp-utils.ts
    - src/app/(platform)/dashboard/rsvp/page.tsx
    - src/app/(platform)/dashboard/rsvp/actions.ts
    - src/components/rsvp/RsvpDashboard.tsx
    - src/components/rsvp/RsvpGuestList.tsx
    - src/components/rsvp/MealOptionsEditor.tsx
    - src/app/(platform)/dashboard/events/[id]/meal-options/page.tsx
  modified:
    - src/app/(platform)/dashboard/page.tsx
    - src/app/(platform)/dashboard/events/actions.ts
    - src/app/(platform)/dashboard/events/[id]/page.tsx
decisions:
  - decision: "Accordion pattern for per-event stats"
    rationale: "Clean way to show breakdown without overwhelming view"
  - decision: "Client-side status filter for guest list"
    rationale: "Guest lists typically <500; instant filtering UX"
  - decision: "Move buttons over drag-drop for meal options"
    rationale: "Simpler implementation; works well for short lists"
metrics:
  duration: 7 min
  completed: 2026-01-17
---

# Phase 5 Plan 4: RSVP Dashboard Summary

Couple-facing RSVP dashboard with stats, guest list, and meal options configuration.

## One-liner

RSVP dashboard with attendance stats, filterable guest list, and per-event meal options editor.

## Commits

| Hash | Message |
|------|---------|
| 7c05310 | feat(05-04): add RSVP statistics utilities and server actions |
| 3382d5d | feat(05-04): add RSVP dashboard page and components |
| c8c3f42 | feat(05-04): add meal options configuration page |

## What Was Built

### 1. RSVP Statistics Utilities (src/lib/rsvp/rsvp-utils.ts)
- `getRsvpStats(tenantId)`: Overall attendance summary (invited, responded, attending, declined, pending, headcount with +1s)
- `getRsvpStatsPerEvent(tenantId)`: Per-event breakdown with meal choice tallies
- Uses withTenantContext for tenant isolation

### 2. RSVP Dashboard Page (src/app/(platform)/dashboard/rsvp/page.tsx)
- Server component with auth check
- Fetches stats, per-event breakdown, guest list, and RSVP code in parallel
- Renders RsvpDashboard and RsvpGuestList components
- Links to Export CSV and Send Reminders (Plan 05 routes)

### 3. RsvpDashboard Component
- Stats cards: Total Invited (with response rate), Attending (with headcount), Declined, Pending
- RSVP code management: Set/update code, copy link button, preview link
- Per-event accordion showing:
  - Invited/Attending/Declined/Pending counts
  - Meal choice tallies

### 4. RsvpGuestList Component
- Searchable/filterable guest table
- Status filter buttons: All, Attending, Declined, Pending (with counts)
- Expandable rows for guests with multiple events
- Shows meal choice and dietary notes for attending guests

### 5. Meal Options Configuration
- `updateMealOptions` server action with validation
- MealOptionsEditor component:
  - Add/edit/delete options
  - Move up/down reordering
  - Required name, optional description
- /dashboard/events/[id]/meal-options page with breadcrumb navigation
- Added "Meal Options" link to event detail page

## Technical Decisions

1. **Accordion for per-event stats**: Clean expandable UI that doesn't overwhelm the dashboard
2. **Client-side guest filtering**: Guest lists typically under 500; instant filter UX without server round-trips
3. **Move buttons over drag-drop**: For meal options reordering, simpler than implementing dnd-kit for a typically short list

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] /dashboard/rsvp page with RSVP statistics (123+ lines in utils)
- [x] Stats include total, attending, declined, pending counts
- [x] Per-event stats show meal tallies (accordion with mealCounts)
- [x] Guest list shows all guests with RSVP status (RsvpGuestList 324 lines)
- [x] RSVP code can be set and displayed (setRsvpCode action + UI)
- [x] /dashboard/events/[id]/meal-options allows meal configuration (MealOptionsEditor 236 lines)

## Files Changed

| File | Lines | Purpose |
|------|-------|---------|
| src/lib/rsvp/rsvp-utils.ts | 123 | RSVP statistics utilities |
| src/app/(platform)/dashboard/rsvp/actions.ts | 119 | Dashboard server actions |
| src/app/(platform)/dashboard/rsvp/page.tsx | 103 | RSVP dashboard page |
| src/components/rsvp/RsvpDashboard.tsx | 320 | Stats and code UI |
| src/components/rsvp/RsvpGuestList.tsx | 324 | Guest response list |
| src/components/rsvp/MealOptionsEditor.tsx | 236 | Meal options editor |
| src/app/(platform)/dashboard/events/[id]/meal-options/page.tsx | 98 | Meal options page |
| src/app/(platform)/dashboard/events/actions.ts | +82 | updateMealOptions action |
| src/app/(platform)/dashboard/events/[id]/page.tsx | +12 | Meal options link |
| src/app/(platform)/dashboard/page.tsx | +3 | RSVP dashboard link |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Plan 05-05 (Email Notifications) can proceed. The RSVP dashboard provides:
- Guest data with RSVP status for targeted notifications
- Per-event breakdown for event-specific reminders
- Links to Send Reminders route ready for implementation
