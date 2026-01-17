# Phase 8 Plan 1: Guest Messaging Data Layer Summary

**One-liner:** BroadcastMessage model with MessageStatus enum, BroadcastEmail template, and server actions for send/schedule/cancel operations using Resend API.

## What Was Built

### Database Schema
- **MessageStatus enum:** PENDING, SENT, CANCELLED, FAILED for tracking message lifecycle
- **BroadcastMessage model:** Stores broadcast messages with scheduling support
  - Fields: id, weddingId, subject, content (@db.Text), scheduledFor, sentAt, status, resendEmailIds[], recipientCount, createdAt, updatedAt
  - Indexes: weddingId, weddingId+status (for efficient dashboard queries)
- **Wedding.broadcastMessages relation:** Links wedding to all broadcast messages

### Email Template
- **BroadcastEmail.tsx:** React Email component for broadcast messages
  - Personalized greeting with guest name
  - Content rendered as paragraphs (split by newlines)
  - Optional CTA button with customizable text and URL
  - Footer with couple names
  - Same styling pattern as RsvpReminderEmail

### Server Actions
- **getBroadcastMessages(tenantId):** List all messages for wedding, ordered by createdAt desc
- **getBroadcastMessage(tenantId, messageId):** Get single message with full details
- **sendBroadcast(formData):** Send immediate broadcast
  - Uses Resend batch API (up to 100 emails per call)
  - Validates subject (required, max 200 chars) and content (required)
  - Filters guests with email addresses only
  - Creates BroadcastMessage record with status SENT
- **scheduleBroadcast(formData):** Schedule for future delivery
  - Uses individual resend.emails.send() with scheduledAt (batch doesn't support it)
  - Validates scheduledFor is within 30 days (Resend limit)
  - Adds 500ms delay between sends to avoid rate limiting
  - Stores all resendEmailIds for cancellation
  - Creates BroadcastMessage with status PENDING
- **cancelBroadcast(messageId):** Cancel scheduled message
  - Only allows cancellation if status is PENDING
  - Calls resend.emails.cancel(id) for each stored email ID
  - Updates status to CANCELLED

### Validation
- Zod schemas for broadcast and schedule operations
- Subject: required, max 200 chars
- Content: required
- ScheduledFor: must be in future, within 30 days
- CTA URL: valid URL format if provided

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 067ab0d | feat | Add BroadcastMessage schema and MessageStatus enum |
| 671326b | feat | Create BroadcastEmail template and messaging server actions |

## Files Changed

| File | Changes |
|------|---------|
| prisma/schema.prisma | Added MessageStatus enum, BroadcastMessage model, Wedding.broadcastMessages relation |
| src/components/emails/BroadcastEmail.tsx | New email template with personalized greeting and optional CTA |
| src/app/(platform)/dashboard/messaging/actions.ts | Server actions for send, schedule, cancel, list operations |

## Verification Results

- [x] npx prisma db push succeeds
- [x] npx prisma generate succeeds
- [x] npm run build compiles without TypeScript errors
- [x] Schema includes MessageStatus enum and BroadcastMessage model
- [x] BroadcastEmail.tsx exports BroadcastEmail component
- [x] actions.ts exports sendBroadcast, scheduleBroadcast, cancelBroadcast, getBroadcastMessages

## Deviations from Plan

None - plan executed exactly as written.

## Duration

~5 minutes

## Next Steps

Plan 08-02 will implement the messaging UI components (compose form, message list, message detail view).
