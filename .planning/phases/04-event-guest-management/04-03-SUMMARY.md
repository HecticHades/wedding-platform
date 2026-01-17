---
phase: 04-event-guest-management
plan: 03
subsystem: guest-management-ui
tags: [guests, crud, forms, search, tailwind]
dependency-graph:
  requires: [04-01]
  provides: [guest-list-page, guest-form, guest-actions]
  affects: [04-04]
tech-stack:
  added: []
  patterns: [server-actions, client-side-search, useTransition-forms]
key-files:
  created:
    - src/app/(platform)/dashboard/guests/actions.ts
    - src/app/(platform)/dashboard/guests/page.tsx
    - src/app/(platform)/dashboard/guests/new/page.tsx
    - src/app/(platform)/dashboard/guests/[id]/page.tsx
    - src/components/guests/GuestCard.tsx
    - src/components/guests/GuestList.tsx
    - src/components/guests/GuestForm.tsx
  modified: []
decisions:
  - id: guest-form-zod-transform
    choice: "Zod transform for empty string to null on optional fields"
    rationale: "Email/phone fields accept empty strings but store as null for clean database"
  - id: client-side-search
    choice: "Client-side filtering for guest search"
    rationale: "Guest lists typically <500; avoids server round-trips for search"
  - id: delete-via-action
    choice: "Delete calls server action directly from GuestCard"
    rationale: "Simpler than lifting state; router.refresh() updates list"
metrics:
  duration: 4 min
  completed: 2026-01-17
---

# Phase 04 Plan 03: Guest Management UI Summary

Guest CRUD UI with server actions, form validation, client-side search, and party size tracking.

## What Was Built

### Server Actions (`actions.ts`)
- **createGuest**: Validates with Zod, creates guest in tenant's wedding
- **updateGuest**: Verifies guest belongs to tenant before updating
- **deleteGuest**: Removes guest, EventGuest records cascade automatically
- Email field transforms empty string to null, validates format only if provided

### Components

**GuestCard.tsx**
- Displays guest name, email, phone, party info
- Badges for party name, party size, and plus-one status
- Delete with inline confirmation using useTransition

**GuestList.tsx**
- Client-side search by name or email
- Alphabetical sorting
- Empty state with CTA to add first guest
- Summary stats: guest count and total attendees

**GuestForm.tsx**
- All fields: name (required), email, phone, partyName, partySize, allowPlusOne
- Checkbox for plus-one using form action submission
- useTransition for pending state during submission
- Works in both create and edit modes

### Pages

**guests/page.tsx**
- Server component with auth + tenant check
- Fetches guests ordered by name
- Includes eventInvitations count per guest
- Shows total guests and total attendees summary

**guests/new/page.tsx**
- Renders GuestForm in create mode
- Breadcrumb: Dashboard > Guests > Add

**guests/[id]/page.tsx**
- Fetches single guest with event invitations
- Shows which events guest is invited to (read-only)
- Displays RSVP status badges if present
- Two-column layout: form + invitations sidebar

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Tenant Isolation
All queries use `withTenantContext` which automatically adds `wedding: { tenantId }` filter via Prisma extension. Delete/update operations verify guest exists within tenant before modifying.

### Form Handling Pattern
```typescript
const handleSubmit = (formData: FormData) => {
  startTransition(async () => {
    const result = await createGuest(formData);
    if (result.success) {
      router.push("/dashboard/guests");
      router.refresh();
    }
  });
};
```

### Email Validation Strategy
```typescript
email: z
  .string()
  .email("Invalid email format")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val === "" ? null : val)),
```
Accepts empty string from form, validates email format only if provided, stores null for empty.

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compiles | Pass |
| createGuest exported | Pass |
| updateGuest exported | Pass |
| deleteGuest exported | Pass |
| Guest page > 30 lines | Pass (67 lines) |
| GuestForm > 60 lines | Pass (206 lines) |
| prisma.guest with tenant context | Pass |

## Commits

| Hash | Message |
|------|---------|
| 025fedb | feat(04-03): create guest server actions |
| 9d0f3ef | feat(04-03): create guest management components |
| 9059436 | feat(04-03): create guest management pages |

## Next Phase Readiness

Plan 04-04 (Event/Guest Assignment UI) can now build on:
- Guest list data model and CRUD operations
- Component patterns (cards, lists, forms)
- Server action patterns for mutations

The EventGuest join table from 04-01 connects guests to events; 04-04 will provide the UI to manage those assignments.
