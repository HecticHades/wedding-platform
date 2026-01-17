# Phase 8: Guest Messaging - Research

**Researched:** 2026-01-17
**Domain:** Email broadcast and scheduling with Resend
**Confidence:** HIGH

## Summary

Phase 8 implements couple-to-guest messaging using the existing Resend infrastructure established in Phase 5. The core requirements are:
- MSG-01: Broadcast emails to all guests with email addresses
- MSG-02: Schedule messages for future delivery
- MSG-03: Guest receives email notifications for updates

The existing codebase already has Resend 4.5.1 installed with a working client (`src/lib/email/resend.ts`), react-email templates (`@react-email/components`), and a proven pattern for sending batch emails via the RSVP reminder feature. The primary new capability is scheduled message delivery, which Resend supports natively via the `scheduledAt` parameter (up to 30 days in advance).

**Primary recommendation:** Use Resend's native `scheduledAt` parameter for scheduling (not Vercel cron jobs), store message records in the database for tracking/cancellation, and build a broadcast composer UI following the RSVP reminders page pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 4.5.1 | Email API | Already installed; modern, developer-friendly API |
| @react-email/components | 0.0.36 | Email templates | Already installed; React-based email templating |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.24.2 | Validation | Already installed; form/input validation |
| lucide-react | 0.469.0 | Icons | Already installed; UI icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend scheduledAt | Vercel Cron + DB queue | Unnecessary complexity; Resend handles scheduling natively |
| Database message queue | In-memory queue | Database persistence enables UI for viewing/canceling scheduled messages |
| Batch API for scheduled | Individual sends | Batch API does NOT support scheduledAt - must use individual sends for scheduled messages |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(platform)/dashboard/messaging/
│   ├── page.tsx                    # Message history/list page
│   ├── actions.ts                  # Server actions (send, schedule, cancel)
│   ├── compose/
│   │   └── page.tsx                # Compose new message
│   └── [id]/
│       └── page.tsx                # View single message details
├── components/emails/
│   ├── BroadcastEmail.tsx          # Generic broadcast template
│   └── RsvpReminderEmail.tsx       # Existing (Phase 5)
├── lib/email/
│   └── resend.ts                   # Existing Resend client
└── prisma/schema.prisma            # Add BroadcastMessage model
```

### Pattern 1: Database-Backed Message Queue
**What:** Store all broadcast messages in the database with Resend email IDs for tracking
**When to use:** Always for scheduled messages; optionally for immediate sends for audit trail
**Example:**
```typescript
// Source: Project pattern + Resend API docs
model BroadcastMessage {
  id           String   @id @default(cuid())
  weddingId    String
  wedding      Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  subject      String
  content      String   @db.Text     // HTML content

  // Scheduling
  scheduledFor DateTime?             // null = sent immediately
  sentAt       DateTime?             // When actually sent
  status       MessageStatus @default(PENDING)

  // Resend tracking
  resendEmailIds String[]            // Array of Resend email IDs for cancellation
  recipientCount Int

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([weddingId])
  @@index([weddingId, status])
}

enum MessageStatus {
  PENDING    // Scheduled but not yet sent
  SENT       // Successfully delivered to Resend
  CANCELLED  // Cancelled before sending
  FAILED     // Failed to send
}
```

### Pattern 2: Individual Sends for Scheduled Messages
**What:** Use `resend.emails.send()` individually (not batch) when scheduling
**When to use:** When scheduledAt is set - batch API does not support scheduling
**Example:**
```typescript
// Source: https://resend.com/docs/api-reference/emails/send-email
// Batch API does NOT support scheduledAt - must use individual sends
const emailIds: string[] = [];

for (const guest of guests) {
  const { data, error } = await resend.emails.send({
    from: "Wedding Updates <noreply@resend.dev>",
    to: guest.email,
    subject: subject,
    react: BroadcastEmail({ guestName: guest.name, content, coupleNames }),
    scheduledAt: scheduledFor.toISOString(), // ISO 8601 or natural language
  });

  if (data?.id) {
    emailIds.push(data.id);
  }
}

// Store all email IDs for potential cancellation
await prisma.broadcastMessage.create({
  data: {
    weddingId,
    subject,
    content,
    scheduledFor,
    status: "PENDING",
    resendEmailIds: emailIds,
    recipientCount: emailIds.length,
  }
});
```

### Pattern 3: Batch Send for Immediate Delivery
**What:** Use `resend.batch.send()` for immediate broadcasts (up to 100 emails per call)
**When to use:** When sending immediately without scheduling
**Example:**
```typescript
// Source: https://resend.com/docs/api-reference/emails/send-batch-emails
// Batch API supports up to 100 emails per call
const BATCH_SIZE = 100;
const batches = chunk(guests, BATCH_SIZE);

for (const batch of batches) {
  const emails = batch.map((guest) => ({
    from: "Wedding Updates <noreply@resend.dev>",
    to: guest.email,
    subject: subject,
    react: BroadcastEmail({ guestName: guest.name, content, coupleNames }),
  }));

  await resend.batch.send(emails);
}
```

### Pattern 4: Message Cancellation
**What:** Cancel scheduled messages by calling Resend's cancel API for each stored email ID
**When to use:** When user cancels a pending scheduled message
**Example:**
```typescript
// Source: https://resend.com/docs/api-reference/emails/cancel-email
export async function cancelScheduledMessage(messageId: string) {
  const message = await prisma.broadcastMessage.findUnique({
    where: { id: messageId },
    select: { resendEmailIds: true, status: true },
  });

  if (!message || message.status !== "PENDING") {
    return { success: false, error: "Message not found or already sent" };
  }

  // Cancel each scheduled email in Resend
  for (const emailId of message.resendEmailIds) {
    try {
      await resend.emails.cancel(emailId);
    } catch (error) {
      console.error(`Failed to cancel email ${emailId}:`, error);
    }
  }

  await prisma.broadcastMessage.update({
    where: { id: messageId },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}
```

### Anti-Patterns to Avoid
- **Using Vercel Cron for scheduling:** Resend has native scheduling; cron adds complexity
- **Batch API for scheduled sends:** Batch API does NOT support scheduledAt parameter
- **No persistence for scheduled messages:** Without DB record, can't cancel or track
- **Storing full HTML per recipient:** Store template + content once, render per recipient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email scheduling | Cron job + queue | Resend `scheduledAt` | Built-in, handles timezone, retries |
| Batch sending | Loop with delays | Resend `batch.send()` | Rate-limit aware, up to 100/call |
| Email templates | Raw HTML strings | react-email | Cross-client compatibility, DX |
| Date/time input | Custom picker | Native `<input type="datetime-local">` | Browser-native, good enough for MVP |
| Timezone handling | Custom conversion | ISO 8601 strings | Resend accepts ISO 8601, store as UTC |

**Key insight:** Resend handles the hard parts (scheduling, retries, rate limits, delivery). The app's job is UI + persistence for tracking.

## Common Pitfalls

### Pitfall 1: Using Batch API for Scheduled Sends
**What goes wrong:** Batch API silently ignores `scheduledAt` parameter; emails send immediately
**Why it happens:** Batch API docs don't prominently warn about this limitation
**How to avoid:** Always use individual `resend.emails.send()` when `scheduledAt` is set
**Warning signs:** Scheduled messages arriving immediately instead of at scheduled time

### Pitfall 2: Rate Limiting on Individual Sends
**What goes wrong:** 429 errors when sending many scheduled emails individually
**Why it happens:** Default rate limit is 2 requests/second
**How to avoid:** Add delays between sends: `await sleep(500)` between each send
**Warning signs:** First 2-3 emails succeed, rest fail with rate limit errors

### Pitfall 3: No Way to Cancel Scheduled Messages
**What goes wrong:** User can't cancel a message after scheduling; embarrassing emails go out
**Why it happens:** Didn't store Resend email IDs in database
**How to avoid:** Always store `resendEmailIds[]` array when scheduling
**Warning signs:** UI shows scheduled messages but no cancel button functionality

### Pitfall 4: Scheduling Too Far in Advance
**What goes wrong:** API rejects schedule request
**Why it happens:** Resend only allows scheduling up to 30 days in advance
**How to avoid:** Validate `scheduledFor` is within 30 days before API call
**Warning signs:** "scheduled_at must be within 30 days" error from Resend

### Pitfall 5: Sending to Guests Without Emails
**What goes wrong:** Null email causes API errors or empty sends
**Why it happens:** Guest model has optional email field
**How to avoid:** Filter guests with `where: { email: { not: null } }` before sending
**Warning signs:** Error logs showing null recipient, or fewer emails sent than expected

## Code Examples

Verified patterns from official sources:

### Send Scheduled Email
```typescript
// Source: https://resend.com/docs/dashboard/emails/schedule-email
import { resend } from "@/lib/email/resend";

// Option 1: ISO 8601 format
const { data, error } = await resend.emails.send({
  from: "Wedding Updates <noreply@resend.dev>",
  to: "[email protected]",
  subject: "Save the Date Reminder",
  react: BroadcastEmail({ /* props */ }),
  scheduledAt: "2026-02-14T10:00:00.000Z",
});

// Option 2: Natural language (Resend parses this)
const { data, error } = await resend.emails.send({
  // ...
  scheduledAt: "in 2 weeks",
});

// Option 3: Programmatic (1 week from now)
const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const { data, error } = await resend.emails.send({
  // ...
  scheduledAt: oneWeekFromNow.toISOString(),
});
```

### Cancel Scheduled Email
```typescript
// Source: https://resend.com/docs/api-reference/emails/cancel-email
const { data, error } = await resend.emails.cancel(
  "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
);
// Returns: { object: "email", id: "49a3999c-..." }
// Note: Cancelled emails cannot be rescheduled
```

### Retrieve Email Status
```typescript
// Source: https://resend.com/docs/api-reference/emails/retrieve-email
const { data, error } = await resend.emails.get(
  "37e4414c-5e25-4dbc-a071-43552a4bd53b"
);
// data.last_event: "delivered" | "bounced" | "complained" | etc.
// data.scheduled_at: ISO string if scheduled, null if sent immediately
```

### Broadcast Email Template (react-email)
```typescript
// Source: Pattern from existing RsvpReminderEmail.tsx
import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Preview, Hr,
} from "@react-email/components";

export interface BroadcastEmailProps {
  guestName: string;
  coupleNames: string;
  subject: string;
  content: string;      // HTML content from rich editor
  ctaText?: string;     // Optional CTA button
  ctaUrl?: string;
}

export function BroadcastEmail({
  guestName,
  coupleNames,
  content,
  ctaText,
  ctaUrl,
}: BroadcastEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A message from {coupleNames}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", padding: "20px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "16px", color: "#374151", lineHeight: "1.6" }}>
            Dear {guestName},
          </Text>

          {/* Render HTML content */}
          <div dangerouslySetInnerHTML={{ __html: content }} />

          {ctaText && ctaUrl && (
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: "#22c55e",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                {ctaText}
              </Button>
            </Section>
          )}

          <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

          <Text style={{ fontSize: "12px", color: "#6b7280" }}>
            This message was sent by {coupleNames}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### Rate-Limited Individual Sends
```typescript
// For scheduled emails that can't use batch API
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendScheduledToAll(
  guests: { email: string; name: string }[],
  subject: string,
  content: string,
  scheduledAt: Date,
  coupleNames: string
): Promise<string[]> {
  const emailIds: string[] = [];

  for (const guest of guests) {
    const { data, error } = await resend.emails.send({
      from: "Wedding Updates <noreply@resend.dev>",
      to: guest.email,
      subject,
      react: BroadcastEmail({ guestName: guest.name, coupleNames, content, subject }),
      scheduledAt: scheduledAt.toISOString(),
    });

    if (data?.id) {
      emailIds.push(data.id);
    }

    // Rate limit: 2 req/sec, so wait 500ms between sends
    await sleep(500);
  }

  return emailIds;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 72-hour scheduling limit | 30-day scheduling limit | April 2025 | Can schedule "save the date" reminders earlier |
| Timestamp-only scheduling | Natural language scheduling | February 2025 | "in 2 weeks" works as scheduledAt value |
| No tags on scheduled emails | Tags supported on scheduled | September 2025 | Better organization/filtering in dashboard |

**Deprecated/outdated:**
- Manual cron jobs for email scheduling: Use Resend's native `scheduledAt` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Rich text editor for message composition**
   - What we know: Content needs to be HTML for email rendering
   - What's unclear: Best lightweight WYSIWYG editor for Next.js
   - Recommendation: Start with plain textarea + markdown, or basic contenteditable; upgrade if users request

2. **Recipient filtering beyond "has email"**
   - What we know: Current requirement is "all guests with email addresses"
   - What's unclear: Will couples want to segment (e.g., by event, by RSVP status)?
   - Recommendation: Build simple "all guests" first; add filters in later phase if needed

3. **Email open/click tracking**
   - What we know: Resend provides `last_event` status per email
   - What's unclear: Whether to poll for updates or use webhooks
   - Recommendation: Out of scope for MVP; polling is simpler if added later

## Sources

### Primary (HIGH confidence)
- [Resend Schedule Email Docs](https://resend.com/docs/dashboard/emails/schedule-email) - scheduledAt parameter, 30-day limit, natural language support
- [Resend Cancel Email API](https://resend.com/docs/api-reference/emails/cancel-email) - cancellation endpoint and response format
- [Resend Batch API](https://resend.com/docs/api-reference/emails/send-batch-emails) - 100 email limit, NO scheduledAt support
- [Resend Retrieve Email API](https://resend.com/docs/api-reference/emails/retrieve-email) - email status tracking
- Existing codebase: `src/lib/email/resend.ts`, `src/components/emails/RsvpReminderEmail.tsx`, `src/app/(platform)/dashboard/rsvp/actions.ts`

### Secondary (MEDIUM confidence)
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs/quickstart) - Evaluated and rejected for this use case
- [React Email Templates](https://react.email/templates) - Template patterns and components

### Tertiary (LOW confidence)
- Wedding industry messaging best practices (general patterns, not code-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already installed and proven in Phase 5
- Architecture: HIGH - Follows existing project patterns, Resend API well-documented
- Pitfalls: HIGH - Discovered through API docs (batch vs scheduled limitation)

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - Resend API is stable)
