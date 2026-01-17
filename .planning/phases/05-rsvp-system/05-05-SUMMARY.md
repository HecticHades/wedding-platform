---
phase: 05-rsvp-system
plan: 05
subsystem: rsvp-notifications
tags: [csv-export, email, reminders, papaparse, resend]
requires:
  - 05-04 (RSVP dashboard with guest data)
provides:
  - CSV export API endpoint for RSVP data
  - RSVP reminder email template
  - Batch reminder email sending action
affects:
  - 05-06 (Guest export may share utilities)
tech-stack:
  added: []
  patterns:
    - Route Handler for file download
    - React Email for transactional templates
    - Resend batch API for bulk sending
key-files:
  created:
    - src/lib/rsvp/export-utils.ts
    - src/app/(platform)/api/export/rsvp/route.ts
    - src/components/emails/RsvpReminderEmail.tsx
    - src/app/(platform)/dashboard/rsvp/reminders/page.tsx
    - src/app/(platform)/dashboard/rsvp/reminders/SendRemindersForm.tsx
  modified:
    - src/app/(platform)/dashboard/rsvp/page.tsx
    - src/app/(platform)/dashboard/rsvp/actions.ts
decisions:
  - decision: "Route Handler over Server Action for CSV export"
    rationale: "Route Handlers better for file downloads with proper Content-Disposition headers"
  - decision: "noreply@resend.dev as from address"
    rationale: "Resend test domain for development; production uses verified domain"
  - decision: "Preview list limited to 10 guests"
    rationale: "Shows representative sample without overwhelming UI"
metrics:
  duration: 5 min
  completed: 2026-01-17
---

# Phase 5 Plan 5: Email Notifications Summary

CSV export of RSVP data and email reminder functionality for non-responders.

## One-liner

CSV export endpoint with papaparse and batch reminder emails using Resend and React Email templates.

## Commits

| Hash | Message |
|------|---------|
| 1774745 | feat(05-05): add CSV export API endpoint for RSVP data |
| 68469d6 | feat(05-05): add RSVP reminder email template |
| a2d3572 | feat(05-05): implement reminder email sending action and UI |

## What Was Built

### 1. CSV Export Utilities (src/lib/rsvp/export-utils.ts)
- `RsvpExportData` interface defining export row shape
- `generateRsvpCsv(data)`: Transforms data to CSV using Papa.unparse()
- Column headers: Guest Name, Email, Phone, Party, Event, Status, Plus Ones, Plus One Name, Meal Choice, Dietary Notes, Responded At

### 2. CSV Export Route Handler (src/app/(platform)/api/export/rsvp/route.ts)
- GET endpoint with session auth check
- Uses withTenantContext for tenant isolation
- Flattens guest-event combinations to rows
- Returns CSV with Content-Type and Content-Disposition headers
- Filename: rsvp-export-YYYY-MM-DD.csv

### 3. RSVP Reminder Email (src/components/emails/RsvpReminderEmail.tsx)
- React Email template with @react-email/components
- Props: guestName, coupleNames, weddingDate, rsvpUrl, eventNames
- Styled email body with:
  - Preview text for inbox
  - Personal greeting
  - List of pending events
  - Green CTA button linking to RSVP page
  - Footer note

### 4. Send Reminders Action (src/app/(platform)/dashboard/rsvp/actions.ts)
- `sendRsvpReminders()` server action
- Queries guests with email AND at least one null rsvpStatus
- Builds RSVP URL from tenant subdomain
- Uses `resend.batch.send()` for efficient bulk delivery
- Returns { success: true, sent: count } or error

### 5. Send Reminders Page (src/app/(platform)/dashboard/rsvp/reminders/)
- Server page showing preview of recipients
- Displays guest name, email, and pending events
- SendRemindersForm client component with:
  - Loading state during send
  - Success/error feedback
  - Guest count in button text

## Technical Decisions

1. **Route Handler for CSV**: Server Actions can't properly set Content-Disposition headers for file downloads
2. **Resend batch API**: More efficient than individual sends; handles rate limiting
3. **Preview list cap at 10**: Shows representative sample without scrolling forever

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] GET /api/export/rsvp returns CSV file (Content-Type: text/csv)
- [x] CSV includes all guest-event combinations with correct headers
- [x] RsvpReminderEmail template renders (169 lines, min 40)
- [x] sendRsvpReminders finds guests with pending responses
- [x] Reminders only sent to guests with email addresses
- [x] Dashboard has Export and Send Reminders buttons

## Files Changed

| File | Lines | Purpose |
|------|-------|---------|
| src/lib/rsvp/export-utils.ts | 40 | CSV generation utilities |
| src/app/(platform)/api/export/rsvp/route.ts | 82 | CSV export endpoint |
| src/components/emails/RsvpReminderEmail.tsx | 169 | Reminder email template |
| src/app/(platform)/dashboard/rsvp/actions.ts | +121 | sendRsvpReminders action |
| src/app/(platform)/dashboard/rsvp/page.tsx | ~3 | Updated export link |
| src/app/(platform)/dashboard/rsvp/reminders/page.tsx | 141 | Reminders page |
| src/app/(platform)/dashboard/rsvp/reminders/SendRemindersForm.tsx | 80 | Send form component |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Plan 05-06 (Guest Export) can proceed. This plan provides:
- CSV export pattern that can be extended
- export-utils.ts ready for reuse
- Complete RSVP notification pipeline
