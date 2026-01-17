---
phase: 05-rsvp-system
plan: 03
subsystem: rsvp-form-ui
tags: [rsvp, forms, guest-facing, meal-selection, plus-one]

dependency-graph:
  requires: [05-01, 05-02]
  provides: [Guest RSVP form page, Event RSVP submission, RSVP confirmation]
  affects: [05-04, 05-05]

tech-stack:
  added: []
  patterns: [server-actions, form-state-management, conditional-rendering]

key-files:
  created:
    - src/app/[domain]/rsvp/[guestId]/page.tsx
    - src/app/[domain]/rsvp/[guestId]/actions.ts
    - src/app/[domain]/rsvp/[guestId]/RsvpFormPage.tsx
    - src/components/rsvp/EventRsvpForm.tsx
    - src/components/rsvp/RsvpConfirmation.tsx
  modified: []

decisions:
  - id: "05-03-001"
    choice: "Per-event RSVP form pattern"
    rationale: "Each event rendered as separate form allows independent submission and progress tracking"
  - id: "05-03-002"
    choice: "Progress indicator for multi-event response"
    rationale: "Shows guests how many events they've responded to, encourages completion"
  - id: "05-03-003"
    choice: "Conditional form fields based on attendance"
    rationale: "Only show meal/dietary/plus-one when attending - reduces cognitive load for declines"

metrics:
  duration: 5 min
  completed: 2026-01-17
---

# Phase 05 Plan 03: RSVP Form UI Summary

**One-liner:** Guest-facing RSVP form with per-event attendance, plus-one tracking, meal selection, and dietary restrictions.

## What Was Built

### Server Actions (actions.ts)

**getGuestWithEvents(guestId)**
- Fetches guest with wedding info and event invitations
- Includes current RSVP status for each event
- Returns meal options per event
- Validates guest exists

**submitRsvp(guestId, formData)**
- Zod validation for RSVP data
- Security check: verifies guest owns EventGuest record
- Updates EventGuest with rsvpStatus, rsvpAt, plusOneCount, plusOneName, mealChoice, dietaryNotes
- Uses compound key for update: `eventId_guestId`

### Per-Event RSVP Form (EventRsvpForm.tsx)

**Form Fields:**
- Attendance: "Joyfully Accept" / "Regretfully Decline" buttons
- Plus-one section (conditional on `allowPlusOne` and attending)
  - Number select (0-5)
  - Guest name text input
- Meal selection (conditional on event having options and attending)
  - Radio buttons with name and description
- Dietary restrictions textarea (conditional on attending)

**Features:**
- Event header with name, date, location, dress code
- "Responded" badge for already-submitted events
- Pre-populated form for existing responses
- Loading state via useTransition
- Error display for failed submissions

### RSVP Page (page.tsx + RsvpFormPage.tsx)

**Security:**
- Validates subdomain matches guest's wedding
- Returns notFound() for cross-tenant access attempts

**UI:**
- Wedding header with couple names and date
- Guest greeting badge ("Hi, [Name]!")
- Progress indicator: "X of Y events responded"
- Events sorted chronologically
- Confirmation screen when all events responded
- Toggle to review/update responses

### Confirmation Component (RsvpConfirmation.tsx)

- Thank you message with guest name
- Event count summary
- Link back to wedding homepage
- Note about updating responses

## Technical Decisions

1. **Per-event form pattern** - Each event gets its own form card. Allows independent submission without losing progress on other events. Better UX than one giant form.

2. **Progress tracking** - Visual progress bar shows "2 of 3 events responded". Encourages guests to complete all RSVPs.

3. **Conditional field visibility** - When declining, hide meal/dietary/plus-one fields. Reduces form complexity for guests not attending.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 05-02 prerequisite files not found**
- **Found during:** Task 1 preparation
- **Issue:** 05-03 depends on 05-02 but files existed without SUMMARY
- **Fix:** Verified existing 05-02 files were already implemented
- **Files verified:** src/app/[domain]/rsvp/actions.ts, RsvpCodeEntry.tsx, GuestLookup.tsx, page.tsx, RsvpPageClient.tsx

## Files Changed

| File | Lines | Changes |
|------|-------|---------|
| `src/app/[domain]/rsvp/[guestId]/actions.ts` | 169 | New - server actions |
| `src/app/[domain]/rsvp/[guestId]/page.tsx` | 83 | New - server component |
| `src/app/[domain]/rsvp/[guestId]/RsvpFormPage.tsx` | 142 | New - client form state |
| `src/components/rsvp/EventRsvpForm.tsx` | 348 | New - per-event form |
| `src/components/rsvp/RsvpConfirmation.tsx` | 67 | New - confirmation display |

## Verification Results

| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| page.tsx min 50 lines | Pass (83 lines) |
| actions.ts exports submitRsvp, getGuestWithEvents | Pass |
| EventRsvpForm.tsx min 80 lines | Pass (348 lines) |
| RsvpConfirmation.tsx min 30 lines | Pass (67 lines) |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| cbb2037 | feat | Add RSVP submission server actions |
| 17ddec1 | feat | Add per-event RSVP form component |
| 4357d02 | feat | Add guest RSVP page and confirmation component |

## Next Phase Readiness

**Ready for 05-04 (RSVP Dashboard):**
- EventGuest records now populated with RSVP data
- Server actions can be extended for couple-side queries
- Meal counts and attendance stats can be aggregated

**Artifacts provided:**
- `/rsvp/[guestId]` - Working guest RSVP submission page
- `submitRsvp` action - Reusable RSVP update pattern
- `EventRsvpForm` - Reusable per-event form component
