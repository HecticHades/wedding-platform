# Phase 5: RSVP System - Research

**Researched:** 2026-01-17
**Domain:** RSVP flow, guest authentication via code, meal preferences, dashboard/analytics, CSV export, email reminders
**Confidence:** HIGH

## Summary

Phase 5 builds the complete RSVP system on top of the guest/event infrastructure established in Phase 4. The database schema already has the `EventGuest` join table with RSVP fields (`rsvpStatus`, `rsvpAt`, `plusOneCount`, `plusOneName`, `mealChoice`, `dietaryNotes`) ready to be populated. The `Wedding` model already has an `rsvpCode` field for guest authentication. The key work is building the flows: guest-facing RSVP submission, couple-facing dashboard/export, and admin cross-tenant RSVP viewing.

The standard approach uses **RSVP code authentication** (not email/password) for guest access, allowing guests to look up their invitation by entering the wedding code and their name. Per-event RSVP responses with meal selection and dietary restrictions are stored on the existing `EventGuest` records. Couple dashboards use Prisma aggregations (`groupBy`, `_count`) to calculate attendance and meal tallies.

The existing codebase patterns are well-suited for this phase: server actions for RSVP submission, `withTenantContext` for couple dashboard queries, direct Prisma queries (no tenant context) for admin cross-wedding views. CSV export uses Route Handlers (not server actions) to trigger browser downloads. Email reminders use Resend for reliable delivery.

**Primary recommendation:** Implement guest lookup via RSVP code + name search. Store meal options as JSON array on Event model. Use Route Handler for CSV export. Use Resend for email reminders with React Email templates.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 6.x | Database queries with groupBy aggregation | Already installed, handles RSVP stats elegantly |
| Zod | 3.x | RSVP form validation | Already installed, consistent with codebase |
| Server Actions | Next.js 16 | RSVP submission mutations | Established pattern for data mutations |
| Route Handlers | Next.js 16 | CSV export endpoint | Better than server actions for file downloads |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Resend | 4.x | Email delivery for reminders | Reliable email API with React Email support |
| @react-email/components | latest | Email templates | Build type-safe email templates as React components |
| papaparse | 5.x | CSV generation | Simple, reliable CSV stringification |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | Nodemailer + SMTP | Resend simpler API, better deliverability, no SMTP config needed |
| papaparse | Manual CSV generation | papaparse handles escaping, quotes, edge cases properly |
| RSVP code + name lookup | Email-based auth | Code lookup simpler UX (no password), matches invitation card pattern |
| JSON meal options on Event | Separate MealOption table | JSON simpler for small option lists (<10 per event), no extra joins |

**Installation:**
```bash
npm install resend @react-email/components papaparse
npm install -D @types/papaparse
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (platform)/
│   │   ├── dashboard/
│   │   │   ├── rsvp/
│   │   │   │   ├── page.tsx              # RSVP dashboard overview
│   │   │   │   └── actions.ts            # Set RSVP code, send reminders
│   │   │   ├── events/
│   │   │   │   └── [id]/
│   │   │   │       └── meal-options/
│   │   │   │           └── page.tsx      # Configure meal options per event
│   │   │   └── settings/
│   │   │       └── page.tsx              # RSVP code configuration
│   │   ├── admin/
│   │   │   └── rsvp/
│   │   │       └── page.tsx              # Cross-wedding RSVP view (ADMIN-03)
│   │   └── api/
│   │       ├── export/
│   │       │   └── rsvp/
│   │       │       └── route.ts          # CSV export endpoint
│   │       └── email/
│   │           └── reminder/
│   │               └── route.ts          # Email reminder sender
│   └── [domain]/
│       └── rsvp/
│           ├── page.tsx                  # RSVP code entry + name lookup
│           └── [guestId]/
│               └── page.tsx              # Guest's RSVP form for all events
├── components/
│   ├── rsvp/
│   │   ├── RsvpCodeEntry.tsx            # Enter RSVP code form
│   │   ├── GuestLookup.tsx              # Search guest by name
│   │   ├── EventRsvpForm.tsx            # Per-event RSVP with meal selection
│   │   ├── RsvpConfirmation.tsx         # Success confirmation
│   │   ├── RsvpDashboard.tsx            # Couple dashboard stats
│   │   ├── RsvpGuestList.tsx            # List of responses
│   │   └── MealOptionsEditor.tsx        # Configure meal options per event
│   └── emails/
│       └── RsvpReminderEmail.tsx        # React Email template
└── lib/
    ├── rsvp/
    │   ├── rsvp-utils.ts                # RSVP calculation helpers
    │   └── export-utils.ts              # CSV generation
    └── email/
        └── resend.ts                    # Resend client config
```

### Pattern 1: RSVP Code Authentication Flow

**What:** Guests access RSVP form via wedding code (printed on invitation) + name search
**When to use:** All guest-facing RSVP flows

The flow:
1. Guest navigates to `{subdomain}.domain.com/rsvp`
2. If wedding has `rsvpCode` set, show code entry form
3. Guest enters code, validated against `wedding.rsvpCode`
4. On valid code, show name search form
5. Guest enters their name, fuzzy search against `Guest.name` for that wedding
6. On match, redirect to `/rsvp/{guestId}` with session/cookie for that guest
7. Guest sees all events they're invited to, submits RSVP for each

**Example:**
```typescript
// src/app/[domain]/rsvp/page.tsx
import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";
import { RsvpCodeEntry } from "@/components/rsvp/RsvpCodeEntry";
import { GuestLookup } from "@/components/rsvp/GuestLookup";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function RsvpPage({ params }: PageProps) {
  const { domain } = await params;

  // Look up wedding by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: { wedding: true },
  });

  if (!tenant?.wedding) {
    notFound();
  }

  const wedding = tenant.wedding;

  // Check if RSVP code is required
  if (!wedding.rsvpCode) {
    // No code required - go directly to guest lookup
    return <GuestLookup weddingId={wedding.id} />;
  }

  // Check if guest already authenticated via cookie
  const cookieStore = await cookies();
  const rsvpAuth = cookieStore.get(`rsvp_auth_${wedding.id}`);

  if (rsvpAuth?.value === wedding.rsvpCode) {
    // Already authenticated - show guest lookup
    return <GuestLookup weddingId={wedding.id} />;
  }

  // Show code entry form
  return <RsvpCodeEntry weddingId={wedding.id} />;
}
```

### Pattern 2: Per-Event RSVP with Meal Selection

**What:** Each event has its own meal options; guest RSVPs per-event
**When to use:** All RSVP submission flows

Store meal options as JSON on the Event model (simpler than separate table for <10 options):

```typescript
// Add to Event model in schema.prisma
// mealOptions Json @default("[]")  // Array of {id, name, description?}

// Type definition
interface MealOption {
  id: string;       // UUID or slug
  name: string;     // "Chicken", "Vegetarian", "Kids Meal"
  description?: string;
}

// Example meal options JSON
[
  { "id": "chicken", "name": "Herb-Roasted Chicken", "description": "With seasonal vegetables" },
  { "id": "beef", "name": "Grilled Filet Mignon", "description": "Medium-rare, with red wine reduction" },
  { "id": "veg", "name": "Garden Risotto", "description": "Vegetarian, vegan-adaptable" },
  { "id": "kids", "name": "Kids Meal", "description": "Chicken tenders with fries" }
]
```

**RSVP submission flow:**
```typescript
// src/app/[domain]/rsvp/[guestId]/actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const rsvpSchema = z.object({
  eventId: z.string(),
  rsvpStatus: z.enum(["ATTENDING", "DECLINED"]),
  plusOneCount: z.coerce.number().int().min(0).optional(),
  plusOneName: z.string().optional().transform(v => v === "" ? null : v),
  mealChoice: z.string().optional().transform(v => v === "" ? null : v),
  dietaryNotes: z.string().optional().transform(v => v === "" ? null : v),
});

export async function submitRsvp(guestId: string, formData: FormData) {
  const parsed = rsvpSchema.safeParse({
    eventId: formData.get("eventId"),
    rsvpStatus: formData.get("rsvpStatus"),
    plusOneCount: formData.get("plusOneCount"),
    plusOneName: formData.get("plusOneName"),
    mealChoice: formData.get("mealChoice"),
    dietaryNotes: formData.get("dietaryNotes"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid RSVP data" };
  }

  const data = parsed.data;

  // Update EventGuest record
  await prisma.eventGuest.update({
    where: {
      eventId_guestId: {
        eventId: data.eventId,
        guestId,
      },
    },
    data: {
      rsvpStatus: data.rsvpStatus,
      rsvpAt: new Date(),
      plusOneCount: data.plusOneCount,
      plusOneName: data.plusOneName,
      mealChoice: data.mealChoice,
      dietaryNotes: data.dietaryNotes,
    },
  });

  return { success: true };
}
```

### Pattern 3: Dashboard Statistics with Prisma groupBy

**What:** Aggregate RSVP data for couple dashboard
**When to use:** RSVP dashboard, admin views

```typescript
// src/lib/rsvp/rsvp-utils.ts

import { prisma, withTenantContext } from "@/lib/db/prisma";

export interface RsvpStats {
  totalInvited: number;
  totalResponded: number;
  attending: number;
  declined: number;
  pending: number;
  mealCounts: Record<string, number>;
  totalHeadcount: number;  // Including plus-ones
}

export async function getRsvpStats(tenantId: string): Promise<RsvpStats> {
  return withTenantContext(tenantId, async () => {
    // Get wedding
    const wedding = await prisma.wedding.findFirst({
      select: { id: true },
    });

    if (!wedding) {
      throw new Error("Wedding not found");
    }

    // Get all EventGuest records for this wedding's events
    const eventGuests = await prisma.eventGuest.findMany({
      where: {
        event: { weddingId: wedding.id },
      },
      select: {
        rsvpStatus: true,
        plusOneCount: true,
        mealChoice: true,
      },
    });

    const totalInvited = eventGuests.length;
    const responded = eventGuests.filter(eg => eg.rsvpStatus !== null);
    const attending = responded.filter(eg => eg.rsvpStatus === "ATTENDING");
    const declined = responded.filter(eg => eg.rsvpStatus === "DECLINED");

    // Count meals
    const mealCounts: Record<string, number> = {};
    for (const eg of attending) {
      if (eg.mealChoice) {
        mealCounts[eg.mealChoice] = (mealCounts[eg.mealChoice] || 0) + 1;
      }
    }

    // Total headcount (guests + plus-ones who are attending)
    const totalHeadcount = attending.reduce(
      (sum, eg) => sum + 1 + (eg.plusOneCount || 0),
      0
    );

    return {
      totalInvited,
      totalResponded: responded.length,
      attending: attending.length,
      declined: declined.length,
      pending: totalInvited - responded.length,
      mealCounts,
      totalHeadcount,
    };
  });
}

// Alternative using Prisma groupBy for meal counts
export async function getMealCountsByEvent(eventId: string) {
  const counts = await prisma.eventGuest.groupBy({
    by: ["mealChoice"],
    where: {
      eventId,
      rsvpStatus: "ATTENDING",
      mealChoice: { not: null },
    },
    _count: {
      mealChoice: true,
    },
  });

  return counts.map(c => ({
    meal: c.mealChoice,
    count: c._count.mealChoice,
  }));
}
```

### Pattern 4: CSV Export via Route Handler

**What:** Export RSVP data as downloadable CSV file
**When to use:** COUPLE-08 requirement

Route Handlers are better than Server Actions for file downloads because they can stream the response and set proper headers.

```typescript
// src/app/(platform)/api/export/rsvp/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Papa from "papaparse";

export async function GET() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, partner1Name: true, partner2Name: true },
    });

    if (!wedding) {
      return null;
    }

    // Get all guests with their RSVP data
    const guests = await prisma.guest.findMany({
      include: {
        eventInvitations: {
          include: {
            event: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { wedding, guests };
  });

  if (!data) {
    return new NextResponse("Wedding not found", { status: 404 });
  }

  // Transform to flat CSV rows
  const rows = data.guests.flatMap(guest =>
    guest.eventInvitations.map(inv => ({
      "Guest Name": guest.name,
      "Email": guest.email || "",
      "Phone": guest.phone || "",
      "Party Name": guest.partyName || "",
      "Event": inv.event.name,
      "RSVP Status": inv.rsvpStatus || "Pending",
      "Plus Ones": inv.plusOneCount || 0,
      "Plus One Name": inv.plusOneName || "",
      "Meal Choice": inv.mealChoice || "",
      "Dietary Notes": inv.dietaryNotes || "",
      "Responded At": inv.rsvpAt?.toISOString() || "",
    }))
  );

  // Generate CSV
  const csv = Papa.unparse(rows);

  // Return as downloadable file
  const filename = `rsvp-export-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
```

### Pattern 5: Email Reminders with Resend

**What:** Send reminder emails to guests who haven't responded
**When to use:** RSVP-07 requirement

```typescript
// src/lib/email/resend.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// src/components/emails/RsvpReminderEmail.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Preview,
} from "@react-email/components";

interface RsvpReminderEmailProps {
  guestName: string;
  coupleNames: string;
  weddingDate: string;
  rsvpUrl: string;
}

export function RsvpReminderEmail({
  guestName,
  coupleNames,
  weddingDate,
  rsvpUrl,
}: RsvpReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Please RSVP for {coupleNames}'s wedding</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>RSVP Reminder</Heading>
          <Text>Dear {guestName},</Text>
          <Text>
            We noticed you haven't yet responded to the wedding invitation
            from {coupleNames} on {weddingDate}.
          </Text>
          <Text>
            Please take a moment to let them know if you can attend:
          </Text>
          <Link href={rsvpUrl}>RSVP Now</Link>
          <Text>Thank you!</Text>
        </Container>
      </Body>
    </Html>
  );
}

// src/app/(platform)/dashboard/rsvp/actions.ts
"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { resend } from "@/lib/email/resend";
import { RsvpReminderEmail } from "@/components/emails/RsvpReminderEmail";

export async function sendRsvpReminders() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      include: {
        tenant: true,
        guests: {
          where: {
            email: { not: null },
            eventInvitations: {
              some: {
                rsvpStatus: null,  // Not yet responded
              },
            },
          },
        },
      },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const coupleNames = `${wedding.partner1Name} & ${wedding.partner2Name}`;
    const weddingDate = wedding.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString()
      : "TBD";

    const baseUrl = `https://${wedding.tenant.subdomain}.yourdomain.com`;

    // Send emails (batch for efficiency)
    const emails = wedding.guests
      .filter(g => g.email)
      .map(guest => ({
        from: "noreply@yourdomain.com",
        to: guest.email!,
        subject: `RSVP Reminder: ${coupleNames}'s Wedding`,
        react: RsvpReminderEmail({
          guestName: guest.name,
          coupleNames,
          weddingDate,
          rsvpUrl: `${baseUrl}/rsvp?guest=${guest.id}`,
        }),
      }));

    if (emails.length === 0) {
      return { success: true, sent: 0 };
    }

    // Resend batch send (up to 100 at a time)
    const { data, error } = await resend.batch.send(emails);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, sent: emails.length };
  });

  return result;
}
```

### Anti-Patterns to Avoid

- **Don't use server actions for CSV download:** Server actions return serializable data, not file streams. Use Route Handlers for file downloads.
- **Don't store meal options in a separate table:** For typical wedding use (<10 meal options per event), JSON on Event is simpler and faster.
- **Don't require email/password auth for guests:** RSVP code + name is simpler UX and matches physical invitation pattern.
- **Don't skip input validation on RSVP submission:** Guests can manipulate form data; always validate with Zod.
- **Don't forget tenant isolation on admin views:** Admin can see all weddings but must explicitly query without tenant context.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV generation | String concatenation | papaparse | Handles escaping, quotes, newlines in data correctly |
| Email sending | SMTP with nodemailer | Resend | Better deliverability, simpler API, webhook support |
| Email templates | HTML strings | @react-email/components | Type-safe, reusable, proper rendering |
| Name fuzzy search | LIKE query | Prisma contains + startsWith | Good enough for guest lists <500, already available |
| Form validation | Manual checks | Zod schemas | Consistent with codebase, type-safe, good error messages |

**Key insight:** Wedding RSVP systems look simple but have subtle edge cases (meal quantities, plus-one naming, dietary restrictions with commas in CSV, email deliverability). Using established libraries handles these edge cases.

## Common Pitfalls

### Pitfall 1: RSVP Code Not Set

**What goes wrong:** Couple forgets to set RSVP code, guests can't access RSVP form or anyone can access without code.
**Why it happens:** Optional field on Wedding model, no enforcement.
**How to avoid:**
- Add validation in RSVP dashboard that warns if code not set
- Consider making code auto-generated on wedding creation
- Show prominent "Set your RSVP code" CTA in dashboard
**Warning signs:** Guests reporting they can't RSVP, or spam RSVPs appearing.

### Pitfall 2: Plus-One Count vs Guest.allowPlusOne Mismatch

**What goes wrong:** Guest tries to bring plus-one but wasn't granted permission, or couple expects plus-one tracking but guest doesn't see the option.
**Why it happens:** `Guest.allowPlusOne` controls visibility, `EventGuest.plusOneCount` stores the response.
**How to avoid:**
- RSVP form checks `guest.allowPlusOne` before showing plus-one fields
- Dashboard shows both "allowed" and "confirmed" plus-one counts
- Clear labeling in UI
**Warning signs:** Plus-one counts don't match invitations, guests confused about options.

### Pitfall 3: Meal Options Per Event vs Global

**What goes wrong:** Different events (rehearsal vs reception) need different meal options, but options are stored wedding-wide.
**Why it happens:** Simplistic data model assumes same meals everywhere.
**How to avoid:**
- Store `mealOptions: Json` on Event model, not Wedding
- RSVP form loads meal options per-event
- Meal config UI is per-event at `/dashboard/events/[id]/meal-options`
**Warning signs:** Guests selecting "Kids Meal" for rehearsal dinner that doesn't offer it.

### Pitfall 4: CSV Export Without Proper Escaping

**What goes wrong:** Dietary notes like `"No peanuts, tree nuts"` break CSV parsing due to commas.
**Why it happens:** Hand-rolled CSV generation doesn't escape properly.
**How to avoid:**
- Use papaparse for CSV generation
- Always test with data containing commas, quotes, newlines
**Warning signs:** Excel shows garbled columns, caterer reports incorrect data.

### Pitfall 5: Email Reminder Spam

**What goes wrong:** Couple sends too many reminders, guests mark as spam, deliverability drops.
**Why it happens:** No tracking of when reminders were sent.
**How to avoid:**
- Track last reminder sent date on Guest or EventGuest
- Limit reminder frequency (e.g., once per week max)
- Show "last reminded" date in dashboard
- Consider soft limit with warning before sending
**Warning signs:** Low email open rates, guests complaining about spam.

### Pitfall 6: Admin View Without Tenant Context Awareness

**What goes wrong:** Admin RSVP view accidentally filtered by tenant context, shows empty results.
**Why it happens:** Copy-paste from couple dashboard code that uses `withTenantContext`.
**How to avoid:**
- Admin views explicitly query WITHOUT tenant context
- Use raw `prisma` import, not `withTenantContext` wrapper
- Add explicit joins to show wedding/tenant info in results
**Warning signs:** Admin sees no RSVP data, or only sees their own wedding's data.

## Code Examples

Verified patterns based on official documentation and project codebase:

### Guest Name Lookup (Prisma contains)

```typescript
// Source: Project codebase pattern from GuestList.tsx + Prisma docs
export async function findGuestByName(weddingId: string, searchName: string) {
  const guests = await prisma.guest.findMany({
    where: {
      weddingId,
      name: {
        contains: searchName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      partyName: true,
    },
    take: 10,  // Limit results for performance
  });

  return guests;
}
```

### RSVP Status Update

```typescript
// Source: Project codebase pattern from events/actions.ts
export async function updateRsvpStatus(
  eventId: string,
  guestId: string,
  data: {
    rsvpStatus: "ATTENDING" | "DECLINED";
    plusOneCount?: number;
    plusOneName?: string;
    mealChoice?: string;
    dietaryNotes?: string;
  }
) {
  return prisma.eventGuest.update({
    where: {
      eventId_guestId: { eventId, guestId },
    },
    data: {
      rsvpStatus: data.rsvpStatus,
      rsvpAt: new Date(),
      plusOneCount: data.plusOneCount ?? 0,
      plusOneName: data.plusOneName ?? null,
      mealChoice: data.mealChoice ?? null,
      dietaryNotes: data.dietaryNotes ?? null,
    },
  });
}
```

### RSVP Cookie Authentication

```typescript
// Source: Next.js cookies() API pattern
// Set cookie after RSVP code validated
import { cookies } from "next/headers";

export async function validateRsvpCode(weddingId: string, code: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { rsvpCode: true },
  });

  if (!wedding?.rsvpCode || wedding.rsvpCode !== code) {
    return { valid: false };
  }

  // Set auth cookie (expires in 30 days)
  const cookieStore = await cookies();
  cookieStore.set(`rsvp_auth_${weddingId}`, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,  // 30 days
  });

  return { valid: true };
}
```

### Admin Cross-Wedding RSVP Query

```typescript
// Source: Project pattern from admin/weddings/page.tsx (no tenant context)
import { prisma } from "@/lib/db/prisma";  // NOT withTenantContext

export async function getAdminRsvpOverview() {
  // Admin queries all weddings directly (no tenant filter)
  const weddings = await prisma.wedding.findMany({
    include: {
      tenant: {
        select: { subdomain: true },
      },
      _count: {
        select: {
          guests: true,
        },
      },
      events: {
        include: {
          _count: {
            select: {
              guestInvitations: {
                where: { rsvpStatus: "ATTENDING" },
              },
            },
          },
        },
      },
    },
  });

  return weddings.map(w => ({
    subdomain: w.tenant.subdomain,
    coupleNames: `${w.partner1Name} & ${w.partner2Name}`,
    totalGuests: w._count.guests,
    events: w.events.map(e => ({
      name: e.name,
      attending: e._count.guestInvitations,
    })),
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server Actions for file download | Route Handlers for file download | Next.js 13+ | Server Actions can't stream files; Route Handlers can |
| Nodemailer + SMTP | Resend API | 2023-2024 | Better deliverability, simpler setup, built-in analytics |
| HTML string email templates | React Email components | 2023 | Type-safe, reusable, better DX |
| Separate MealOption table | JSON on Event model | 2024+ pattern | Simpler for small option lists, fewer joins |

**Deprecated/outdated:**
- **SendGrid free tier:** Limited, prefer Resend for new projects
- **getServerSession():** Use `auth()` from next-auth v5 directly
- **API routes in pages/api:** Use Route Handlers in app/api

## Open Questions

Things that couldn't be fully resolved:

1. **RSVP Deadline Enforcement**
   - What we know: Some weddings need hard RSVP deadlines
   - What's unclear: Should we block RSVPs after deadline, or just warn?
   - Recommendation: Add `rsvpDeadline` field to Wedding, show warning but allow late RSVPs (couple can manually close if needed)

2. **Multi-Language RSVP Forms**
   - What we know: International weddings may need translations
   - What's unclear: Full i18n scope is deferred to v2
   - Recommendation: Use plain text that could be swapped later, avoid hardcoded strings in components

3. **Guest Household vs Individual RSVP**
   - What we know: Current model has individual guests with `partySize`
   - What's unclear: Should one guest RSVP for entire household, or each guest separately?
   - Recommendation: Current model allows individual tracking; couple can batch-add family members. Phase 5 tracks per-guest responses.

## Sources

### Primary (HIGH confidence)
- Prisma 6 documentation - groupBy, aggregations, relation queries
- Next.js 16 documentation - Server Actions, Route Handlers, cookies API
- Resend documentation - Next.js integration, batch sending
- Project codebase patterns - server actions, tenant context, forms

### Secondary (MEDIUM confidence)
- [Resend Next.js Integration](https://resend.com/docs/send-with-nextjs) - Email sending patterns
- [papaparse library](https://www.papaparse.com/) - CSV generation
- [React Email components](https://react.email/docs/introduction) - Email template patterns

### Tertiary (LOW confidence)
- [RSVPify meal options feature](https://rsvpify.com/menu-options/) - UX patterns for meal selection
- [Joy RSVP features](https://withjoy.com/blog/11-top-rated-wedding-websites-with-rsvp-features-real-couples-picks/) - Industry standard features
- [WeddingWire forum discussions](https://www.weddingwire.com/wedding-forums/rsvps-meal-option-tracking/0c2c6f94d503dc0a.html) - User expectations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project libraries + well-documented additions
- Architecture: HIGH - Follows established project patterns
- RSVP flow: HIGH - Based on industry standard (code + name lookup)
- Meal options: MEDIUM - JSON approach is pragmatic but could need separate table if requirements expand
- Email reminders: MEDIUM - Resend is solid but email deliverability depends on domain setup

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable domain, patterns well-established)

## Schema Changes Required

The following schema changes are needed for Phase 5:

```prisma
// Add to Event model
model Event {
  // ... existing fields ...

  /// [MealOption[]]
  mealOptions     Json    @default("[]")  // Array of {id, name, description?}
}

// MealOption type for prisma-json-types-generator
// Add to src/types/prisma-json.d.ts
declare namespace PrismaJson {
  interface MealOption {
    id: string;
    name: string;
    description?: string;
  }
}
```

The `EventGuest` RSVP fields are already in place from Phase 4:
- `rsvpStatus: RsvpStatus?`
- `rsvpAt: DateTime?`
- `plusOneCount: Int?`
- `plusOneName: String?`
- `mealChoice: String?`
- `dietaryNotes: String?`

The `Wedding.rsvpCode` field is already in place.
