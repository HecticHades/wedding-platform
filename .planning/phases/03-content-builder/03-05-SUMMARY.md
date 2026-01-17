---
phase: 03-content-builder
plan: 05
subsystem: content-section-editors
tags: [content-editors, vercel-blob, image-upload, forms, useTransition]
dependency-graph:
  requires: [03-01, 03-04]
  provides: [section-editors, image-upload-api, content-persistence]
  affects: [03-06, 04-rsvp]
tech-stack:
  added: []
  patterns: [dynamic-routing, server-actions-forms, vercel-blob-upload, type-guards]
key-files:
  created:
    - src/app/(platform)/dashboard/content/[section]/page.tsx
    - src/app/(platform)/dashboard/content/[section]/actions.ts
    - src/components/content-builder/editors/EventDetailsEditor.tsx
    - src/components/content-builder/editors/OurStoryEditor.tsx
    - src/components/content-builder/editors/TravelEditor.tsx
    - src/components/content-builder/editors/ContactEditor.tsx
    - src/components/content-builder/editors/GalleryEditor.tsx
    - src/components/content-builder/editors/TimelineEditor.tsx
    - src/app/api/upload/route.ts
  modified: []
decisions:
  - id: type-guard-pattern
    choice: "Type guard initialContent at component level"
    reason: "Ensures type safety for discriminated union content types"
  - id: move-buttons-over-drag
    choice: "Simple up/down buttons instead of drag-drop for gallery/timeline"
    reason: "Simpler implementation, still usable UX, drag-drop available in section list"
metrics:
  duration: 6 min
  completed: 2026-01-17
---

# Phase 3 Plan 5: Section Content Editors Summary

**One-liner:** Six specialized content editors with forms for events, story, travel, gallery with Vercel Blob upload, timeline with quick-add suggestions, and contacts with role autocomplete.

## What Was Built

### Dynamic Section Editor Route

**src/app/(platform)/dashboard/content/[section]/page.tsx:**
- Dynamic route accepting section type as parameter
- Validates section type against Zod schema, returns 404 for invalid
- Server component fetches wedding content with tenant context
- Renders appropriate editor based on section type via component map
- Shows "add section first" message when section doesn't exist
- Back link to content management page

**src/app/(platform)/dashboard/content/[section]/actions.ts:**
- `updateSectionContent(sectionType, content)` server action
- Validates session and tenant context
- Validates content against discriminated union Zod schema
- Ensures content.type matches sectionType parameter
- Finds and updates section in contentSections array
- Revalidates both /dashboard/content and section-specific paths

### Content Editors

**EventDetailsEditor.tsx:**
- Multi-event form (ceremony, reception, rehearsal dinner, etc.)
- Each event: name, date picker, time picker, location, address
- Optional: dress code, description
- Add/remove event buttons
- Client-side validation for required fields

**OurStoryEditor.tsx:**
- Title input for section heading
- Large textarea for story (markdown supported)
- Placeholder for future photo upload feature
- Minimal required fields (title, story)

**TravelEditor.tsx:**
- Hotels array with:
  - Name, address (required)
  - Phone, website, booking code, notes (optional)
- Directions textarea for venue directions
- Airport info textarea
- Add/remove hotel buttons

**ContactEditor.tsx:**
- Section title input
- Contacts array with:
  - Name, role (required)
  - Email, phone (optional)
- Role input with datalist autocomplete suggestions
- Additional message textarea for footer

**GalleryEditor.tsx:**
- Title input for gallery heading
- Multi-file upload to Vercel Blob
- Progress indicator during upload
- Photo grid with:
  - Thumbnail preview (next/image)
  - Caption input per photo
  - Move up/down buttons for reordering
  - Delete button
- Empty state with instructions

**TimelineEditor.tsx:**
- Section title input
- Events array with time, title, description
- Move up/down reordering
- Quick-add suggestions for empty state:
  - Ceremony, Cocktail Hour, Reception, Dinner, First Dance, Cake Cutting
- Clock icon for empty state visual

### Image Upload API

**src/app/api/upload/route.ts:**
- POST handler for multipart form data
- Session validation (must be authenticated)
- Tenant context validation
- File type validation: JPEG, PNG, WebP, GIF
- File size validation: 4MB max (Vercel Function limit)
- Uploads to Vercel Blob with tenant-prefixed path
- Returns `{ url: blob.url }` on success
- Appropriate error codes (401, 403, 400, 500)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Type guards in editors | Check initialContent.type at component start | Ensures TypeScript knows exact content type |
| Move buttons over drag | Up/down arrows for gallery/timeline | Simpler than nested dnd-kit, section list already has drag |
| Role datalist | HTML datalist for role autocomplete | Native browser support, no library needed |
| Markdown hint | Mention markdown support in Our Story | Future-proofs for rendering, no deps needed now |
| Quick-add suggestions | Buttons to populate common timeline events | Reduces friction for first-time users |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 0b177f0 | feat | Add dynamic section editor page and updateSectionContent action |
| 3d93ba9 | feat | Add Event Details, Our Story, Travel, and Contact editors |
| 204f1ea | feat | Add Gallery and Timeline editors with image upload API |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Status |
|-------|--------|
| Dynamic route loads correct editor | Verified (component map) |
| Invalid section type returns 404 | Verified (Zod + notFound()) |
| updateSectionContent validates content | Verified (discriminatedUnion) |
| Upload API validates auth, type, size | Verified |
| `npx tsc --noEmit` | Passed |

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/(platform)/dashboard/content/[section]/page.tsx` | Dynamic section editor page | 95 |
| `src/app/(platform)/dashboard/content/[section]/actions.ts` | Update section content action | 67 |
| `src/components/content-builder/editors/EventDetailsEditor.tsx` | Multi-event form editor | 230 |
| `src/components/content-builder/editors/OurStoryEditor.tsx` | Story title and text editor | 118 |
| `src/components/content-builder/editors/TravelEditor.tsx` | Hotels, directions, airport editor | 270 |
| `src/components/content-builder/editors/ContactEditor.tsx` | Contacts with roles editor | 235 |
| `src/components/content-builder/editors/GalleryEditor.tsx` | Photo upload and caption editor | 260 |
| `src/components/content-builder/editors/TimelineEditor.tsx` | Schedule events editor | 270 |
| `src/app/api/upload/route.ts` | Vercel Blob upload API | 68 |

## Next Phase Readiness

Ready for Plan 03-06 (Template Preview):
- All section content can be edited and saved
- Content structure matches Prisma JSON types
- Images uploaded to Vercel Blob with public URLs
- Theme settings from 03-03 ready to combine with content

Dependencies satisfied:
- Section CRUD from 03-04 works with editors
- Content schemas from 03-01 validated in actions
- Theme customization from 03-03 available for preview
