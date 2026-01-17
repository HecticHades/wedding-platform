---
phase: 09-seating-chart
plan: 01
subsystem: seating
tags: [prisma, server-actions, seating, tables]

dependency-graph:
  requires: [08-guest-messaging]
  provides: [table-model, seat-assignment-model, seating-actions]
  affects: [09-02]

tech-stack:
  added: []
  patterns:
    - withTenantContext for data isolation
    - Capacity validation with plus-ones calculation
    - Upsert pattern for guest table assignments

file-tracking:
  key-files:
    created:
      - wedding-platform/src/app/(platform)/dashboard/seating/actions.ts
    modified:
      - wedding-platform/prisma/schema.prisma

decisions:
  - id: plus-one-capacity-calculation
    choice: "Sum (1 + plusOneCount) for ATTENDING events"
    rationale: "Accurate headcount for capacity validation"

metrics:
  duration: 3 min
  completed: 2026-01-17
---

# Phase 9 Plan 1: Seating Data Layer Summary

Table and SeatAssignment Prisma models with server actions for CRUD and guest assignment with capacity validation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Table and SeatAssignment models | 4da11c2 | prisma/schema.prisma |
| 2 | Create seating server actions | ec17eaf | src/app/(platform)/dashboard/seating/actions.ts |

## Implementation Details

### Task 1: Schema Models

Added two models for seating chart functionality:

**Table model:**
- `id`, `weddingId`, `name`, `capacity`, `order`
- Relation to Wedding with cascade delete
- Index on weddingId

**SeatAssignment model:**
- Links Guest to Table with `guestId` unique constraint
- Cascade delete on both Table and Guest deletion
- Compound unique on `[tableId, guestId]`
- Indexes on tableId and guestId

Updated existing models:
- Wedding: Added `tables Table[]` relation
- Guest: Added `seatAssignment SeatAssignment?` relation

### Task 2: Server Actions

Created five server actions following established patterns:

1. **createTable(formData)**: Creates table with auto-incremented order
2. **updateTable(tableId, formData)**: Updates name and capacity
3. **deleteTable(tableId)**: Deletes table (assignments cascade)
4. **assignGuestToTable(guestId, tableId)**: Assigns or unassigns guest with capacity check
5. **reorderTables(orderedIds)**: Updates table order via transaction

**Capacity validation logic:**
- Counts current occupancy: sum of (1 + plusOneCount) for each assigned guest
- plusOneCount pulled from ATTENDING event invitations
- Rejects assignment if currentOccupancy + seatsNeeded > capacity

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npx prisma db push` - SUCCESS
- `npm run build` - SUCCESS
- Schema contains Table and SeatAssignment models - VERIFIED
- Actions file exports all 5 required functions - VERIFIED

## Next Phase Readiness

Ready for 09-02: Seating UI Components
- Table and SeatAssignment models available
- Server actions ready for UI integration
- No blockers identified
