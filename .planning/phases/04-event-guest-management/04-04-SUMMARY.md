---
phase: 04-event-guest-management
plan: 04
subsystem: event-guest-assignment
tags: [events, guests, invitations, visibility, public-site, dashboard]
dependency-graph:
  requires: [04-02, 04-03]
  provides: [event-guest-manager, getVisibleEvents, public-events-display]
  affects: [05-rsvp-system]
tech-stack:
  added: []
  patterns: [bulk-update-transaction, client-checkbox-list, event-visibility-filter]
key-files:
  created:
    - src/lib/events/event-utils.ts
    - src/components/events/EventGuestManager.tsx
    - src/app/(platform)/dashboard/events/[id]/guests/page.tsx
  modified:
    - src/app/(platform)/dashboard/events/actions.ts
    - src/app/(platform)/dashboard/events/[id]/page.tsx
    - src/app/[domain]/page.tsx
    - src/app/(platform)/dashboard/page.tsx
decisions:
  - id: bulk-update-invitations
    choice: "Delete all + create new in transaction for bulk save"
    rationale: "Simplest implementation; atomic update, no diff calculation needed"
  - id: events-section-separate
    choice: "Separate Events section from content-builder event-details"
    rationale: "Database events with access control vs. manual JSON content; coexist"
  - id: public-events-first
    choice: "Display events section above content sections"
    rationale: "Events are primary wedding info; content sections are supplemental"
metrics:
  duration: 8 min
  completed: 2026-01-17
---

# Phase 04 Plan 04: Event/Guest Assignment UI Summary

Event-guest invitation management with bulk save, public site event visibility filtering, and dashboard quick action links.

## What Was Built

### Event Utilities (`src/lib/events/event-utils.ts`)

**getVisibleEvents({ weddingId, guestId? })**
- Fetches all events for a wedding ordered by dateTime
- For anonymous visitors: returns only public events (isPublic=true)
- For identified guests (Phase 5): returns public + invited events
- Returns typed VisibleEvent array with all display fields

### Server Actions (added to `actions.ts`)

**updateEventInvitations(eventId, guestIds[])**
- Bulk update using $transaction for atomicity
- Deletes all existing EventGuest records for event
- Creates new records for provided guestIds
- Validates event belongs to tenant before modification

**inviteGuestToEvent(eventId, guestId)**
- Single guest invitation using upsert
- No-op if already invited

**removeGuestFromEvent(eventId, guestId)**
- Removes single invitation
- Uses deleteMany for safe handling

### EventGuestManager Component

Client component for managing event invitations:
- Checkbox list of all wedding guests
- Summary: "X of Y guests invited (Z total attendees)"
- Quick actions: Select All, Select None
- Search filter when > 5 guests
- Save button only visible when changes pending
- Uses useTransition for loading state

### Event Guest Assignment Page

`/dashboard/events/[id]/guests`:
- Server component with auth/tenant checks
- Fetches event, all guests, and current invitations
- Breadcrumb: Dashboard > Events > [Event] > Manage Guests
- Back link to event detail page
- Private event warning message

### Event Detail Page Update

Added "Manage Guest Invitations" button:
- Shows invitation count badge
- Links to /dashboard/events/[id]/guests
- Styled consistently with green theme

### Public Site Event Display

Updated `src/app/[domain]/page.tsx`:
- Fetches events using getVisibleEvents
- Displays EventsDisplay component with:
  - Event name, date, time (with end time if set)
  - Location with Google Maps link
  - Dress code if specified
  - Description if provided
- Adds "Events" to nav links
- Shows "Event details coming soon" if no public events
- Themed consistently with wedding design

### Dashboard Updates

- Replaced placeholder "Manage Guests (Coming in Phase 4)" with working link
- Added "Manage Events" button (teal color)
- Added "Manage Guests" button (amber color)
- Stats cards now show:
  - Total attendees (sum of party sizes) vs. guest count
  - Next upcoming event name and date

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Event Visibility Logic

```typescript
const visibleEvents = events.filter((event) => {
  if (event.isPublic) return true;
  if (guestId && invitations.length > 0) return true;
  return false;
});
```

Phase 5 will add guest identification via RSVP code to enable private event visibility.

### Bulk Invitation Update

```typescript
await prisma.$transaction(async (tx) => {
  await tx.eventGuest.deleteMany({ where: { eventId } });
  await tx.eventGuest.createMany({
    data: guestIds.map((guestId) => ({ eventId, guestId })),
  });
});
```

All-or-nothing update ensures consistency.

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compiles | Pass |
| updateEventInvitations exported | Pass |
| inviteGuestToEvent exported | Pass |
| removeGuestFromEvent exported | Pass |
| getVisibleEvents exported | Pass |
| EventGuestManager > 60 lines | Pass (192 lines) |
| Event guests page > 30 lines | Pass (80 lines) |
| Dashboard has events/guests links | Pass |
| Public site filters by visibility | Pass |

## Commits

| Hash | Message |
|------|---------|
| b6d2970 | feat(04-04): add invitation server actions and event visibility utility |
| 3c4b181 | feat(04-04): add EventGuestManager component and assignment page |
| 418ca28 | feat(04-04): add public site event visibility and dashboard quick actions |

## Phase 4 Complete

With this plan, Phase 4 (Event Guest Management) is complete:
- 04-01: Event/Guest data model with EventGuest join table
- 04-02: Event CRUD with list, create, edit, delete, reorder
- 04-03: Guest CRUD with party size, plus-one, search
- 04-04: Event-guest assignment and public site visibility

## Next Phase Readiness

Phase 5 (RSVP System) can now build on:
- EventGuest join table with RSVP fields (status, plusOneCount, mealChoice, etc.)
- getVisibleEvents utility (add guestId parameter for guest-specific filtering)
- Guest identification via wedding.rsvpCode for RSVP access
- Public site infrastructure for displaying personalized content
