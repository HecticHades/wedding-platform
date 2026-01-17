---
phase: 03-content-builder
plan: 04
subsystem: content-section-management
tags: [dnd-kit, server-actions, drag-drop, content-management, lucide-react]
dependency-graph:
  requires: [03-01]
  provides: [section-crud, section-reorder, section-visibility]
  affects: [03-05, 03-06]
tech-stack:
  added: [lucide-react]
  patterns: [optimistic-updates, dnd-kit-sortable, server-actions-crud]
key-files:
  created:
    - src/app/(platform)/dashboard/content/actions.ts
    - src/app/(platform)/dashboard/content/page.tsx
    - src/app/(platform)/dashboard/content/content-manager.tsx
    - src/components/content-builder/SortableSectionList.tsx
    - src/components/content-builder/SortableSection.tsx
    - src/components/content-builder/AddSectionDialog.tsx
  modified:
    - package.json
decisions:
  - id: optimistic-updates
    choice: "Immediate UI updates with rollback on error"
    reason: "Better UX for drag-drop and toggle operations"
  - id: section-uniqueness
    choice: "Each section type can only be added once"
    reason: "Simplifies content model and guest experience"
metrics:
  duration: 6 min
  completed: 2026-01-17
---

# Phase 3 Plan 4: Content Section Management Summary

**One-liner:** Drag-and-drop section list with dnd-kit, server actions for CRUD operations, and modal dialog for adding sections from 6 available types.

## What Was Built

### Server Actions

**src/app/(platform)/dashboard/content/actions.ts:**

Four server actions with session/tenant validation:

1. **addSection(type)** - Creates new section with empty content template
   - Validates section type against schema
   - Prevents duplicate section types
   - Uses `createEmptySection()` from section-types utility
   - Appends to contentSections array

2. **updateSectionOrder(sections)** - Handles drag-and-drop reordering
   - Accepts array of {id, order} pairs
   - Updates order field for each section
   - Sorts and persists to database

3. **toggleSectionVisibility(sectionId)** - Shows/hides section from guests
   - Finds section by ID
   - Toggles isVisible boolean

4. **deleteSection(sectionId)** - Removes section
   - Filters out section
   - Re-numbers remaining sections sequentially

All actions use `withTenantContext` for data isolation and `revalidatePath` for cache invalidation.

### Drag-and-Drop Components

**src/components/content-builder/SortableSection.tsx:**
- Individual draggable section card
- Uses `useSortable` hook from dnd-kit
- Displays: drag handle, icon, label, visibility status
- Actions: eye toggle, edit link, delete with confirmation
- Visual feedback: reduced opacity during drag, shadow ring

**src/components/content-builder/SortableSectionList.tsx:**
- Container for sortable sections
- Configures PointerSensor and KeyboardSensor
- Uses `closestCenter` collision detection
- `verticalListSortingStrategy` for smooth vertical reordering
- Optimistic updates with error rollback
- Empty state message when no sections

### Content Management Page

**src/app/(platform)/dashboard/content/page.tsx:**
- Server component wrapper
- Fetches wedding.contentSections with tenant context
- Sorts sections by order field
- Passes to ContentManager client component

**src/app/(platform)/dashboard/content/content-manager.tsx:**
- Client component orchestrating interactive elements
- Section count display
- AddSectionDialog trigger
- SortableSectionList with current sections
- Help tips card explaining drag-and-drop

**src/components/content-builder/AddSectionDialog.tsx:**
- Modal dialog for adding new sections
- Grid of 6 section types with icons and descriptions
- Existing types shown as disabled with "Added" badge
- Close on Escape key or click outside
- Loading state during add operation

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Optimistic updates | Update UI immediately, rollback on error | Better UX for drag-drop interactions |
| Section uniqueness | Each type only once | Simplifies content model and prevents confusion |
| Inline delete confirmation | Two-button confirm/cancel | Prevents accidental deletion without modal overhead |
| Keyboard sensor | Included with sortableKeyboardCoordinates | Accessibility for keyboard-only users |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 371668e | feat | Add content section server actions |
| a13908d | feat | Add drag-and-drop section list components |
| 13a3dff | feat | Add content management page with add section dialog |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Status |
|-------|--------|
| Server actions export all 4 functions | Verified |
| dnd-kit imports in SortableSectionList | Verified |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed |

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/(platform)/dashboard/content/actions.ts` | Server actions for section CRUD | 211 |
| `src/app/(platform)/dashboard/content/page.tsx` | Content management page (server) | 47 |
| `src/app/(platform)/dashboard/content/content-manager.tsx` | Content manager (client) | 53 |
| `src/components/content-builder/SortableSectionList.tsx` | Drag-and-drop list container | 130 |
| `src/components/content-builder/SortableSection.tsx` | Individual sortable section | 130 |
| `src/components/content-builder/AddSectionDialog.tsx` | Modal for adding sections | 166 |

## Next Phase Readiness

Ready for Plan 03-05 (Section Content Editors):
- CRUD operations available for section management
- Section types defined with empty content templates
- Edit links in SortableSection point to `/dashboard/content/[type]`
- Content structure ready for per-type editor components

Dependencies satisfied:
- Server actions handle all structural operations
- UI patterns established for content builder
- lucide-react icons available for editor components
