---
phase: 09-seating-chart
plan: 02
subsystem: seating
tags: [dnd-kit, react, components, drag-drop, seating]

dependency-graph:
  requires: [09-01]
  provides: [seating-chart-ui, table-card, draggable-guest, unassigned-pool]
  affects: [10-testing]

tech-stack:
  added: []
  patterns:
    - Multi-container drag-drop with DndContext
    - Optimistic UI updates with error rollback
    - useDroppable/useDraggable hooks from dnd-kit
    - Inline form modals for CRUD operations

file-tracking:
  key-files:
    created:
      - wedding-platform/src/components/seating/DraggableGuest.tsx
      - wedding-platform/src/components/seating/UnassignedPool.tsx
      - wedding-platform/src/components/seating/TableCard.tsx
      - wedding-platform/src/components/seating/TableForm.tsx
      - wedding-platform/src/components/seating/SeatingChart.tsx
      - wedding-platform/src/app/(platform)/dashboard/seating/page.tsx
    modified: []

decisions:
  - id: multi-container-dnd-context
    choice: "Single DndContext wrapping all containers"
    rationale: "Required for drag between UnassignedPool and multiple TableCards"
  - id: optimistic-updates-with-rollback
    choice: "Local state update on drag, server action async, revert on error"
    rationale: "Instant feedback for better UX while maintaining consistency"
  - id: capacity-validation-client-side
    choice: "Check capacity in drag handler before optimistic update"
    rationale: "Prevents visual 'snap-back' by blocking invalid drops early"

metrics:
  duration: 6 min
  completed: 2026-01-17
---

# Phase 9 Plan 2: Seating UI Components Summary

Interactive seating chart with drag-and-drop guest assignment using dnd-kit multi-container pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create DraggableGuest and UnassignedPool components | c815962 | DraggableGuest.tsx, UnassignedPool.tsx |
| 2 | Create TableCard and TableForm components | 4371f43 | TableCard.tsx, TableForm.tsx |
| 3 | Create SeatingChart and dashboard page | 90c0d7c | SeatingChart.tsx, page.tsx |

## Implementation Details

### Task 1: DraggableGuest and UnassignedPool

**DraggableGuest.tsx:**
- Uses `useDraggable` hook from @dnd-kit/core
- Passes containerId in data for source tracking
- Shows guest name with plus-one badge if applicable
- Visual feedback: opacity + ring when dragging

**UnassignedPool.tsx:**
- Uses `useDroppable` hook with id="unassigned"
- Shows count of unassigned guests
- Visual feedback: blue border/bg when dragging over
- Empty state message when all guests assigned

### Task 2: TableCard and TableForm

**TableCard.tsx:**
- Droppable zone using `useDroppable` with table.id
- Calculates occupancy including plus-ones
- Visual states:
  - Normal: gray border
  - Dragging over (not full): blue border/bg
  - Dragging over (full): red border/bg with warning message
- Edit/delete buttons with inline confirmation modal
- Renders DraggableGuest for each assigned guest

**TableForm.tsx:**
- Simple form for create/edit tables
- Fields: name (text), capacity (number min=1)
- Controlled by parent via onSubmit/onCancel props
- Shows "Create Table" or "Update Table" based on initialData

### Task 3: SeatingChart and Dashboard Page

**SeatingChart.tsx:**
- Multi-container DndContext wrapper
- Sensors with 8px distance constraint for button clicks
- onDragStart/onDragEnd handlers for state management
- Optimistic updates:
  1. Client-side capacity check
  2. Update local state immediately
  3. Call server action async
  4. Revert state on error
- Inline create/edit forms toggled by state
- Responsive grid: 1col mobile, 2col md, 3col lg

**Dashboard page.tsx:**
- Server component fetches data via `getSeatingData`
- Queries tables with seatAssignments including guest plusOneCount
- Filters unassigned guests: no seatAssignment AND has ATTENDING invitation
- Stats display: assigned seats / total seats
- Link to print view page

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npm run build` - SUCCESS
- SeatingChart.tsx: 271 lines (required: 80+) - VERIFIED
- TableCard.tsx: 152 lines (required: 40+) - VERIFIED
- DraggableGuest.tsx: 45 lines (required: 30+) - VERIFIED
- Dashboard page.tsx: 167 lines (required: 50+) - VERIFIED
- assignGuestToTable called in onDragEnd handler - VERIFIED
- useDroppable used in TableCard - VERIFIED

## Next Phase Readiness

Phase 9 (Seating Chart) complete.
- Data layer with capacity validation (09-01)
- Interactive UI with drag-drop assignment (09-02)

Ready for Phase 10 (Testing/Polish) or deployment.
