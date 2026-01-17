---
phase: 04-event-guest-management
plan: 01
subsystem: database
tags: [prisma, schema, guest, event, rsvp, tenant-isolation]

dependency-graph:
  requires: [01-foundation, 02-admin-couple-auth]
  provides: [Guest model, Event model, EventGuest model, RsvpStatus enum, tenant-scoped queries]
  affects: [04-02, 04-03, 04-04, 05-rsvp-management]

tech-stack:
  added: []
  patterns: [join-table-with-metadata, tenant-isolation-via-relations]

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - src/lib/db/prisma.ts

decisions:
  - id: "04-01-001"
    choice: "db push workflow over migrations"
    rationale: "Existing project uses db push; migrations directory doesn't exist"
  - id: "04-01-002"
    choice: "Fix prisma-json-types-generator path"
    rationale: "Cross-platform compatibility - use 'node node_modules/...' provider"
  - id: "04-01-003"
    choice: "EventGuest tenant isolation via event.wedding.tenantId"
    rationale: "EventGuest doesn't have direct wedding relation; scope through event"

metrics:
  duration: 12 min
  completed: 2026-01-17
---

# Phase 04 Plan 01: Event Guest Data Model Summary

**One-liner:** Prisma schema extended with Guest party fields, Event details, and EventGuest join table with RSVP metadata for multi-event guest management.

## What Was Built

### Database Schema Enhancements

**Guest Model Updates:**
- `partyName` (String?) - Household grouping (e.g., "The Smith Family")
- `partySize` (Int, default 1) - Number of people in party
- `allowPlusOne` (Boolean, default false) - Whether guest can bring +1
- `eventInvitations` relation to EventGuest[]
- New index on [weddingId, email] for lookups

**Event Model Updates:**
- `description` (String?) - Event description
- `endTime` (DateTime?) - Event end time
- `address` (String?) - Full address (separate from venue name)
- `dressCode` (String?) - Dress code specification
- `order` (Int, default 0) - Custom display ordering
- `guestInvitations` relation to EventGuest[]
- New index on [weddingId, dateTime] for chronological queries

**EventGuest Join Table (New):**
- Links guests to specific events with invitation metadata
- RSVP fields prepared for Phase 5:
  - `rsvpStatus` (RsvpStatus enum: PENDING, ATTENDING, DECLINED, MAYBE)
  - `rsvpAt` (DateTime?)
  - `plusOneCount`, `plusOneName` (for +1 tracking)
  - `mealChoice`, `dietaryNotes` (for catering)
- Unique constraint on [eventId, guestId] prevents duplicates
- Indexes on eventId and guestId for efficient lookups

### Tenant Isolation

Extended Prisma client with tenant-scoped queries for:

| Model | Operations Added |
|-------|------------------|
| guest | findFirst, update, delete, deleteMany |
| event | findFirst, update, delete, deleteMany |
| eventGuest | findMany, findFirst, delete, deleteMany |

All queries automatically filtered by tenant context via wedding relationship chain.

## Technical Decisions

1. **db push over migrations** - The project uses Prisma's db push workflow. Schema changes are pushed directly to the database without generating migration files.

2. **Generator path fix** - Changed prisma-json-types-generator provider to `node node_modules/prisma-json-types-generator` for cross-platform compatibility.

3. **EventGuest tenant scoping** - Since EventGuest doesn't have direct weddingId, tenant isolation uses the path: `event.wedding.tenantId`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed prisma-json-types-generator ENOENT error**
- **Found during:** Task 2
- **Issue:** `npx prisma generate` failed with `spawn prisma-json-types-generator ENOENT`
- **Fix:** Changed schema generator provider from `"prisma-json-types-generator"` to `"node node_modules/prisma-json-types-generator"`
- **Files modified:** prisma/schema.prisma
- **Commit:** 95c4fa2

## Files Changed

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | +52 lines - RsvpStatus enum, Guest/Event enhancements, EventGuest model |
| `src/lib/db/prisma.ts` | +117 lines - Tenant isolation for guest, event, eventGuest |

## Verification Results

| Check | Status |
|-------|--------|
| `npx prisma validate` | Pass |
| `npx prisma db push` | Pass - Schema synchronized |
| `npx tsc --noEmit` | Pass |
| Prisma client types | EventGuest, RsvpStatus available |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 6a93cbc | feat | Add Guest, Event, EventGuest models with RSVP fields |
| 95c4fa2 | chore | Fix prisma-json-types-generator path and push schema |
| bb8682e | feat | Extend Prisma client with tenant isolation for new models |

## Next Phase Readiness

**Ready for 04-02 (Guest CRUD API):**
- Guest model has all required fields
- Event model has all required fields
- EventGuest join table ready for invitations
- Tenant isolation ensures data security

**Artifacts provided:**
- `prisma/schema.prisma` - Complete data model for guest/event management
- `src/lib/db/prisma.ts` - Tenant-scoped Prisma client extension
