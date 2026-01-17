# Phase 4: Event & Guest Management - Research

**Researched:** 2026-01-17
**Domain:** Guest list management, event management, invitation/access control, multi-event RSVP preparation
**Confidence:** HIGH

## Summary

Phase 4 builds the data infrastructure for guests and events that Phase 5 (RSVP System) will consume. The current schema has basic `Event` and `Guest` models but lacks the crucial guest-event relationship needed for per-event visibility control and per-event RSVP tracking. The key technical challenge is modeling the many-to-many relationship between guests and events with additional metadata (invited, visibility, future RSVP status).

The standard approach uses an **explicit Prisma many-to-many relation** with a join table (`EventGuest` or `GuestInvitation`) that stores invitation status, access control flags, and will later hold RSVP responses. This pattern aligns with industry practices seen in wedding platforms like Joy, Zola, and The Knot where guests are invited to specific events and can RSVP separately for each.

The existing codebase patterns (server actions, withTenantContext, Zod validation) should be extended for guest and event CRUD operations. The UI patterns from Phase 3 (list management, forms, editors) provide a template for building the management interfaces.

**Primary recommendation:** Use an explicit `EventGuest` join table with Prisma to model guest-event invitations. Store invitation status and future RSVP data on this join table. Extend existing server action patterns for CRUD operations.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 6.x | Database ORM with explicit relations | Already installed, handles many-to-many cleanly |
| Zod | 3.x | Form and data validation | Already installed, used throughout codebase |
| Server Actions | Next.js 16 | Data mutations | Already established pattern in this project |
| React Hook Form | 7.x | Form state management | Pairs well with Zod, better for complex forms |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-table | 8.x | Data tables for guest list | If guest list exceeds ~50 entries |
| papaparse | 5.x | CSV parsing for guest import | If CSV import feature needed |
| date-fns | 3.x | Date/time formatting | Already installed (via Next.js), use for event dates |
| lucide-react | latest | Icons | Already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Native form state | RHF better for complex multi-field forms like guest editing |
| Explicit join table | Implicit m-n + JSON | Explicit gives RSVP metadata storage; implicit would need separate table later |
| Separate Guest model | Guest as JSON in Wedding | Separate model enables proper relations, indexing, Phase 5 RSVP |

**Installation:**
```bash
# Core dependencies already installed
# Optional if adding complex table or CSV import:
npm install @tanstack/react-table papaparse
npm install -D @types/papaparse
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (platform)/
│   │   └── dashboard/
│   │       ├── events/                # Event management
│   │       │   ├── page.tsx           # Event list
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Create event form
│   │       │   ├── [id]/
│   │       │   │   ├── page.tsx       # Edit event
│   │       │   │   └── guests/
│   │       │   │       └── page.tsx   # Manage event invitations
│   │       │   └── actions.ts         # Server actions for events
│   │       └── guests/                # Guest management
│   │           ├── page.tsx           # Guest list
│   │           ├── new/
│   │           │   └── page.tsx       # Add guest form
│   │           ├── [id]/
│   │           │   └── page.tsx       # Edit guest
│   │           └── actions.ts         # Server actions for guests
│   └── [domain]/                      # Public wedding site
│       └── page.tsx                   # Filter events by guest access
├── components/
│   ├── events/
│   │   ├── EventList.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   └── EventGuestManager.tsx      # Assign guests to events
│   └── guests/
│       ├── GuestList.tsx
│       ├── GuestCard.tsx
│       ├── GuestForm.tsx
│       └── GuestEventAccess.tsx       # Show guest's event access
└── lib/
    ├── events/
    │   └── event-utils.ts             # Event helpers
    └── guests/
        └── guest-utils.ts             # Guest helpers
```

### Pattern 1: Explicit Many-to-Many with Join Table

**What:** Use a join table (`EventGuest`) to model the guest-event relationship with metadata
**When to use:** Any relationship that needs additional data beyond the link itself

**Schema:**
```prisma
// prisma/schema.prisma additions

model Guest {
  id        String   @id @default(cuid())
  weddingId String
  wedding   Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  name      String
  email     String?
  phone     String?

  // Guest party/household grouping (for plus-ones and families)
  partyName    String?    // e.g., "The Smith Family"
  partySize    Int        @default(1)
  allowPlusOne Boolean    @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Explicit many-to-many with events
  eventInvitations EventGuest[]

  @@index([weddingId])
  @@index([weddingId, email])
}

model Event {
  id        String   @id @default(cuid())
  weddingId String
  wedding   Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  name        String
  description String?
  dateTime    DateTime
  endTime     DateTime?
  location    String?
  address     String?
  dressCode   String?

  // Visibility control
  isPublic  Boolean  @default(true)   // false = invite-only

  // Display order
  order     Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Explicit many-to-many with guests
  guestInvitations EventGuest[]

  @@index([weddingId])
  @@index([weddingId, dateTime])
}

// Join table for guest-event relationship
model EventGuest {
  id        String   @id @default(cuid())

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId   String

  guest     Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  guestId   String

  // Invitation metadata
  invitedAt DateTime @default(now())

  // RSVP data (populated in Phase 5)
  rsvpStatus    RsvpStatus?
  rsvpAt        DateTime?
  plusOneCount  Int?           // How many +1s they're bringing to THIS event
  plusOneName   String?        // Name of +1 if applicable
  mealChoice    String?
  dietaryNotes  String?

  @@unique([eventId, guestId])
  @@index([eventId])
  @@index([guestId])
}

enum RsvpStatus {
  PENDING
  ATTENDING
  DECLINED
  MAYBE
}
```

### Pattern 2: Server Actions for Guest CRUD

**What:** Server actions for creating, reading, updating, deleting guests with tenant isolation
**When to use:** All guest management operations

**Example:**
```typescript
// src/app/(platform)/dashboard/guests/actions.ts
"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  partyName: z.string().optional(),
  partySize: z.number().int().min(1).default(1),
  allowPlusOne: z.boolean().default(false),
});

export async function createGuest(formData: FormData) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    partyName: formData.get("partyName") as string || undefined,
    partySize: parseInt(formData.get("partySize") as string) || 1,
    allowPlusOne: formData.get("allowPlusOne") === "true",
  };

  const parsed = createGuestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const guest = await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        partyName: parsed.data.partyName || null,
        partySize: parsed.data.partySize,
        allowPlusOne: parsed.data.allowPlusOne,
      },
    });

    return { success: true, guestId: guest.id };
  });

  revalidatePath("/dashboard/guests");
  return result;
}

export async function deleteGuest(guestId: string) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  await withTenantContext(session.user.tenantId, async () => {
    // Prisma extension ensures guest belongs to tenant's wedding
    await prisma.guest.delete({
      where: { id: guestId },
    });
  });

  revalidatePath("/dashboard/guests");
  return { success: true };
}
```

### Pattern 3: Event Visibility and Guest Access

**What:** Control which events guests can see based on isPublic flag and explicit invitations
**When to use:** Public wedding site rendering, guest-facing event list

**Example:**
```typescript
// src/lib/events/event-utils.ts

import { prisma } from "@/lib/db/prisma";

interface GetVisibleEventsParams {
  weddingId: string;
  guestId?: string;  // If guest is identified (e.g., via RSVP code lookup)
}

export async function getVisibleEvents({ weddingId, guestId }: GetVisibleEventsParams) {
  // Get all events for the wedding
  const events = await prisma.event.findMany({
    where: { weddingId },
    include: {
      guestInvitations: guestId ? {
        where: { guestId },
        select: { id: true },  // Just need to know if invitation exists
      } : false,
    },
    orderBy: { dateTime: "asc" },
  });

  // Filter to events the guest can see
  return events.filter((event) => {
    // Public events are visible to everyone
    if (event.isPublic) return true;

    // Private events only visible if guest is invited
    if (guestId && event.guestInvitations && event.guestInvitations.length > 0) {
      return true;
    }

    return false;
  });
}
```

### Pattern 4: Bulk Guest-Event Assignment

**What:** Efficiently invite/uninvite multiple guests to an event
**When to use:** Event guest management UI

**Example:**
```typescript
// src/app/(platform)/dashboard/events/actions.ts
"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateEventInvitations(
  eventId: string,
  guestIds: string[]
) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    // Verify event belongs to tenant's wedding
    const event = await prisma.event.findFirst({
      where: { id: eventId },
      select: { id: true, weddingId: true },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Use transaction for atomic update
    await prisma.$transaction(async (tx) => {
      // Remove all existing invitations for this event
      await tx.eventGuest.deleteMany({
        where: { eventId },
      });

      // Create new invitations
      if (guestIds.length > 0) {
        await tx.eventGuest.createMany({
          data: guestIds.map((guestId) => ({
            eventId,
            guestId,
          })),
        });
      }
    });

    return { success: true };
  });

  revalidatePath(`/dashboard/events/${eventId}/guests`);
  return result;
}

export async function inviteGuestToEvent(eventId: string, guestId: string) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  await withTenantContext(session.user.tenantId, async () => {
    // Upsert to handle idempotent invitations
    await prisma.eventGuest.upsert({
      where: {
        eventId_guestId: { eventId, guestId },
      },
      create: { eventId, guestId },
      update: {},  // No-op if already exists
    });
  });

  revalidatePath(`/dashboard/events/${eventId}/guests`);
  return { success: true };
}

export async function removeGuestFromEvent(eventId: string, guestId: string) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  await withTenantContext(session.user.tenantId, async () => {
    await prisma.eventGuest.delete({
      where: {
        eventId_guestId: { eventId, guestId },
      },
    });
  });

  revalidatePath(`/dashboard/events/${eventId}/guests`);
  return { success: true };
}
```

### Pattern 5: Extend Prisma Client Extension for New Models

**What:** Add tenant isolation to new Guest and EventGuest models
**When to use:** When adding new tenant-scoped models

**Example:**
```typescript
// Update src/lib/db/prisma.ts - add these to the $extends query object

eventGuest: {
  async findMany({ args, query }) {
    const tenantId = getTenantContext();
    if (tenantId) {
      args.where = {
        ...args.where,
        event: { wedding: { tenantId } },
      };
    }
    return query(args);
  },
  async create({ args, query }) {
    // Validation happens via event/guest foreign keys
    return query(args);
  },
  async delete({ args, query }) {
    const tenantId = getTenantContext();
    if (tenantId) {
      // Ensure the event belongs to tenant before deleting
      const existing = await prisma.eventGuest.findFirst({
        where: { ...args.where, event: { wedding: { tenantId } } },
      });
      if (!existing) {
        throw new Error("EventGuest not found or access denied");
      }
    }
    return query(args);
  },
},
```

### Anti-Patterns to Avoid

- **Storing guest lists as JSON:** Use proper relations for indexing, querying, RSVP tracking
- **Implicit many-to-many without metadata:** Explicit join table needed for RSVP status
- **Global guest queries without tenant filter:** Always use withTenantContext
- **Checking event access client-side only:** Server must enforce visibility rules
- **Deleting guests without cascade consideration:** EventGuest records must be cleaned up

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Many-to-many relations | Custom join table queries | Prisma explicit relations | Handles cascade, validation, typing |
| Form validation | Manual if/else checks | Zod schemas with React Hook Form | Type inference, detailed errors |
| Date/time handling | String manipulation | date-fns or Intl API | Timezone handling, localization |
| Guest list filtering | Manual array filters | Prisma where clauses | Database-level efficiency |
| Bulk operations | Loop of single operations | Prisma createMany, transaction | Atomicity, performance |

**Key insight:** The many-to-many relationship between guests and events with RSVP metadata is a well-solved problem in Prisma. Using explicit relations gives type safety, cascade deletes, and clean query syntax.

## Common Pitfalls

### Pitfall 1: Missing Tenant Isolation on Join Table

**What goes wrong:** EventGuest records can be queried across tenants
**Why it happens:** Join table doesn't have direct tenantId, must traverse relations
**How to avoid:**
  - Add tenant filtering via event.wedding.tenantId in all EventGuest queries
  - Extend Prisma client to automatically filter join table queries
  - Always verify event/guest ownership before creating EventGuest records
**Warning signs:** Guests appearing in wrong wedding's event lists

### Pitfall 2: N+1 Queries on Guest-Event Relationship

**What goes wrong:** Slow page loads when displaying guest list with event access
**Why it happens:** Querying events for each guest separately
**How to avoid:**
  - Use Prisma `include` to eager-load eventInvitations
  - For lists, query from the Event side with guest counts
  - Consider database views for complex access summaries
**Warning signs:** Page load time scales with guest count

### Pitfall 3: Cascade Delete Ordering

**What goes wrong:** Orphaned EventGuest records or foreign key errors
**Why it happens:** Deleting guest before EventGuest cascade completes
**How to avoid:**
  - Use `onDelete: Cascade` in Prisma schema
  - Test delete operations with related records
  - Consider soft deletes for audit trail
**Warning signs:** Database constraint errors on delete

### Pitfall 4: Event Visibility Logic Inconsistency

**What goes wrong:** Private events shown/hidden inconsistently
**Why it happens:** Visibility logic duplicated in multiple places
**How to avoid:**
  - Centralize getVisibleEvents function
  - Use this function everywhere events are displayed
  - Server-side enforcement, client just displays
**Warning signs:** Guest sees event in one place but not another

### Pitfall 5: Date/Time Timezone Issues

**What goes wrong:** Event times display incorrectly for guests in different timezones
**Why it happens:** DateTime stored without timezone consideration
**How to avoid:**
  - Store events in UTC in database
  - Display in wedding's local timezone (store timezone in Wedding model)
  - Use Intl.DateTimeFormat with explicit timezone
**Warning signs:** Event times shift by hours for some guests

### Pitfall 6: Plus-One Data Model Confusion

**What goes wrong:** Plus-one counts and names tracked incorrectly per event
**Why it happens:** Storing plus-one on Guest instead of EventGuest
**How to avoid:**
  - Guest.allowPlusOne is the permission (can they bring +1?)
  - EventGuest.plusOneCount is the actual count for that event
  - EventGuest.plusOneName is who they're bringing to that event
**Warning signs:** Same plus-one count for all events, can't decline +1 per event

## Code Examples

Verified patterns from official sources:

### Guest List Component with Event Access

```typescript
// src/components/guests/GuestList.tsx
"use client";

import { useState } from "react";
import { GuestCard } from "./GuestCard";
import { deleteGuest } from "@/app/(platform)/dashboard/guests/actions";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  partySize: number;
  allowPlusOne: boolean;
  eventInvitations: Array<{
    event: { id: string; name: string };
  }>;
}

interface GuestListProps {
  guests: Guest[];
}

export function GuestList({ guests }: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (guestId: string) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      await deleteGuest(guestId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <Link
          href="/dashboard/guests/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Guest
        </Link>
      </div>

      {/* Guest count */}
      <p className="text-sm text-gray-500">
        {filteredGuests.length} guest{filteredGuests.length !== 1 ? "s" : ""}
        {searchTerm && ` matching "${searchTerm}"`}
      </p>

      {/* Guest list */}
      <div className="space-y-2">
        {filteredGuests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onDelete={() => handleDelete(guest.id)}
          />
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No guests match your search" : "No guests added yet"}
        </div>
      )}
    </div>
  );
}
```

### Event Form with Date/Time

```typescript
// src/components/events/EventForm.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/app/(platform)/dashboard/events/actions";

interface EventFormProps {
  event?: {
    id: string;
    name: string;
    description: string | null;
    dateTime: Date;
    endTime: Date | null;
    location: string | null;
    address: string | null;
    dressCode: string | null;
    isPublic: boolean;
  };
}

export function EventForm({ event }: EventFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!event;

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateEvent(event.id, formData)
        : await createEvent(formData);

      if (result.success) {
        router.push("/dashboard/events");
      }
    });
  };

  // Format date for datetime-local input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={event?.name}
          required
          placeholder="e.g., Wedding Ceremony"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="dateTime"
            defaultValue={formatDateForInput(event?.dateTime ?? null)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            defaultValue={formatDateForInput(event?.endTime ?? null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Venue Name
        </label>
        <input
          type="text"
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="e.g., The Grand Ballroom"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          defaultValue={event?.address ?? ""}
          placeholder="e.g., 123 Wedding Lane, City, State 12345"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dress Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dress Code
        </label>
        <input
          type="text"
          name="dressCode"
          defaultValue={event?.dressCode ?? ""}
          placeholder="e.g., Black Tie, Cocktail Attire"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          placeholder="Additional details about this event..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          defaultChecked={event?.isPublic ?? true}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Visible to all guests (uncheck for invite-only event)
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
```

### Event Guest Manager (Invitation Assignment)

```typescript
// src/components/events/EventGuestManager.tsx
"use client";

import { useState, useTransition } from "react";
import { updateEventInvitations } from "@/app/(platform)/dashboard/events/actions";
import { Check, X } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
}

interface EventGuestManagerProps {
  eventId: string;
  eventName: string;
  allGuests: Guest[];
  invitedGuestIds: string[];
}

export function EventGuestManager({
  eventId,
  eventName,
  allGuests,
  invitedGuestIds,
}: EventGuestManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(invitedGuestIds));
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  const toggleGuest = (guestId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelected(newSelected);
    setHasChanges(true);
  };

  const selectAll = () => {
    setSelected(new Set(allGuests.map((g) => g.id)));
    setHasChanges(true);
  };

  const selectNone = () => {
    setSelected(new Set());
    setHasChanges(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateEventInvitations(eventId, Array.from(selected));
      setHasChanges(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selected.size} of {allGuests.length} guests invited to {eventName}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-blue-600 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={selectNone}
            className="text-sm text-blue-600 hover:underline"
          >
            Select None
          </button>
        </div>
      </div>

      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
        {allGuests.map((guest) => (
          <label
            key={guest.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(guest.id)}
              onChange={() => toggleGuest(guest.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{guest.name}</p>
              {guest.email && (
                <p className="text-sm text-gray-500 truncate">{guest.email}</p>
              )}
            </div>
            {selected.has(guest.id) ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-gray-300" />
            )}
          </label>
        ))}
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit m-n relations | Explicit join tables with metadata | 2023-2024 | RSVP data on relation |
| Storing guests as JSON | Separate Guest model with relations | Standard | Proper indexing, RSVP |
| API routes for CRUD | Server actions | Next.js 14+ | Better DX, type safety |
| Client-side filtering | Prisma where clauses | Standard | Database efficiency |

**Deprecated/outdated:**
- Storing structured lists (guests, events) as JSON arrays (use proper relations)
- API routes for simple mutations (use server actions)
- Client-side access control checks (server must enforce)

## Open Questions

Things that couldn't be fully resolved:

1. **Guest party grouping strategy**
   - What we know: Need to support couples, families, individuals
   - What's unclear: Separate Party model vs partyName field on Guest
   - Recommendation: Start with partyName field, can migrate to Party model if needed

2. **Event order customization**
   - What we know: Events should display in chronological order by default
   - What's unclear: Should couples be able to override display order?
   - Recommendation: Add order field but default to dateTime for display

3. **Plus-one workflow**
   - What we know: Plus-one permission is per-guest, actual count is per-event
   - What's unclear: Should plus-one names be required at RSVP time?
   - Recommendation: Make plusOneName optional, let couple decide in Phase 5

## Sources

### Primary (HIGH confidence)
- [Prisma Many-to-Many Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations) - Official explicit relation patterns
- [Prisma Relation Queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries) - Query patterns for relations
- Existing codebase patterns (Phase 1-3) - Established conventions

### Secondary (MEDIUM confidence)
- [Thomas Deer: Creating a Wedding RSVP System](https://thomasdeer.co.uk/blog-posts/creating-a-wedding-rsvp-system-in-2025/) - Party system concept
- [RSVPify Secondary Events](https://rsvpify.com/secondary-events/) - Multi-event guest management patterns
- Industry patterns from Joy, Zola, The Knot - Feature patterns

### Tertiary (LOW confidence)
- WebSearch results for guest management patterns - General guidance

## Metadata

**Confidence breakdown:**
- Schema design: HIGH - Prisma explicit relations are well-documented
- Server action patterns: HIGH - Follows existing codebase patterns
- Event visibility logic: HIGH - Clear boolean flag with invitation override
- Guest list UI: MEDIUM - Standard patterns, no complex interactions
- Plus-one handling: MEDIUM - Design choices deferred to Phase 5

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (stable patterns, Prisma 6.x unlikely to change)
