# Phase 9: Seating Chart - Research

**Researched:** 2026-01-17
**Domain:** Seating chart management with drag-and-drop guest assignment
**Confidence:** HIGH

## Summary

This phase implements a seating chart feature allowing couples to create tables and assign RSVP'd guests to them. The key technical challenge is multi-container drag-and-drop (moving guests between tables and an "unassigned" pool) combined with printable export.

The project already has dnd-kit installed (v6.3.1 core, v10.0.0 sortable) and established patterns for both single-container drag-and-drop (content sections) and button-based reordering (meal options). For seating assignment, dnd-kit's multi-container pattern is appropriate since it involves dragging guests between discrete table containers.

**Primary recommendation:** Use dnd-kit's multi-container pattern with `onDragEnd` for guest-to-table assignment. Tables are simple CRUD with capacity validation. Export uses browser print with `@media print` CSS rather than PDF libraries.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives | Already installed, used for content sections |
| @dnd-kit/sortable | ^10.0.0 | Sortable lists within containers | Already installed |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities | Already installed |
| papaparse | ^5.5.3 | CSV export | Already installed, used for RSVP export |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Browser print API | native | Print/PDF export | window.print() with @media print CSS |
| lucide-react | ^0.469.0 | Icons | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Browser print | react-to-print | Extra dependency, but browser print is sufficient for table-based layouts |
| Browser print | pdfmake/jsPDF | Better PDF control but much heavier; browser print creates PDFs via print dialog |
| dnd-kit | react-beautiful-dnd | Deprecated, dnd-kit is the modern replacement and already in use |

**Installation:**
```bash
# No new packages needed - all required libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(platform)/dashboard/seating/
│   ├── page.tsx                 # Main seating chart page
│   ├── actions.ts               # Server actions for tables/assignments
│   └── print/
│       └── page.tsx             # Print-optimized view (separate route)
├── app/[domain]/
│   └── seating/
│       └── page.tsx             # Guest view of their table assignment
├── components/seating/
│   ├── SeatingChart.tsx         # Main drag-and-drop container
│   ├── TableCard.tsx            # Individual table with droppable zone
│   ├── UnassignedPool.tsx       # Pool of guests without table assignment
│   ├── DraggableGuest.tsx       # Draggable guest chip
│   └── SeatingPrintView.tsx     # Print-optimized layout component
└── lib/seating/
    ├── seating-actions.ts       # Server actions (CRUD, assignments)
    └── export-utils.ts          # CSV generation for seating data
```

### Pattern 1: Multi-Container Drag-and-Drop with dnd-kit
**What:** Guests can be dragged from an "unassigned" pool to tables, or between tables
**When to use:** Assigning items to discrete containers where the destination matters
**Example:**
```typescript
// Source: dnd-kit documentation and existing project patterns
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

interface SeatingChartProps {
  tables: Table[];
  unassignedGuests: Guest[];
}

export function SeatingChart({ tables, unassignedGuests }: SeatingChartProps) {
  const [localTables, setLocalTables] = useState(tables);
  const [localUnassigned, setLocalUnassigned] = useState(unassignedGuests);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const guestId = active.id as string;
    const sourceContainer = active.data.current?.containerId;
    const destContainer = over.id as string;

    if (sourceContainer === destContainer) return;

    // Optimistic update
    // ... update local state immediately ...

    // Persist to server
    startTransition(async () => {
      const result = await assignGuestToTable(guestId, destContainer);
      if (!result.success) {
        // Revert on error
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <UnassignedPool guests={localUnassigned} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {localTables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </DndContext>
  );
}
```

### Pattern 2: Droppable Table Container
**What:** Each table acts as a drop zone for guests
**When to use:** Creating discrete drop targets
**Example:**
```typescript
// Source: dnd-kit documentation
import { useDroppable } from "@dnd-kit/core";

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
    data: { type: "table", tableId: table.id },
  });

  const isFull = table.guests.length >= table.capacity;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 rounded-lg p-4 transition-colors",
        isOver && !isFull && "border-blue-500 bg-blue-50",
        isOver && isFull && "border-red-500 bg-red-50",
        !isOver && "border-gray-200"
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{table.name}</h3>
        <span className="text-sm text-gray-500">
          {table.guests.length}/{table.capacity}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {table.guests.map((guest) => (
          <DraggableGuest key={guest.id} guest={guest} containerId={table.id} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Draggable Guest Chip
**What:** Individual guest as a draggable element
**When to use:** Making items movable between containers
**Example:**
```typescript
// Source: dnd-kit documentation and project SortableSection pattern
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableGuestProps {
  guest: Guest;
  containerId: string;
}

export function DraggableGuest({ guest, containerId }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { containerId, guest },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-full text-sm cursor-grab active:cursor-grabbing",
        isDragging && "shadow-lg ring-2 ring-blue-500"
      )}
    >
      <User className="h-3 w-3 text-gray-400" />
      <span>{guest.name}</span>
      {guest.plusOneCount > 0 && (
        <span className="text-xs text-gray-500">+{guest.plusOneCount}</span>
      )}
    </div>
  );
}
```

### Pattern 4: Print-Optimized Export with @media print
**What:** Browser-native print functionality with CSS print styles
**When to use:** Generating printable/PDF output without external libraries
**Example:**
```typescript
// Print page at /dashboard/seating/print
export default async function SeatingPrintPage() {
  const tables = await getTablesWithGuests(tenantId);

  return (
    <>
      {/* Screen-only header with print button */}
      <div className="print:hidden p-4 flex justify-between items-center">
        <h1>Seating Chart</h1>
        <button onClick={() => window.print()} className="...">
          Print / Save as PDF
        </button>
      </div>

      {/* Print-optimized content */}
      <div className="print:p-0 p-8">
        <SeatingPrintView tables={tables} />
      </div>
    </>
  );
}
```

```css
/* In global CSS or component */
@media print {
  /* Hide non-printable elements */
  .print\\:hidden {
    display: none !important;
  }

  /* Reset margins for full page usage */
  @page {
    margin: 0.5in;
    size: letter portrait;
  }

  /* Prevent page breaks inside tables */
  .table-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Force background colors in print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

### Anti-Patterns to Avoid
- **Sorting within tables:** Tables don't need internal ordering - just capacity checking. Don't add SortableContext unless users explicitly request seat positions.
- **Real-time onDragOver updates:** Unlike Kanban boards, seating doesn't need live preview of where item will land. Use simpler `onDragEnd` only.
- **Heavy PDF libraries:** pdfmake/jsPDF add significant bundle size. Browser print handles this use case adequately.

## Database Schema

### New Models Required
```prisma
model Table {
  id        String   @id @default(cuid())
  weddingId String
  wedding   Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  name      String   // "Table 1", "Head Table", etc.
  capacity  Int      // Maximum seats

  order     Int      @default(0)  // Display ordering

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  seatAssignments SeatAssignment[]

  @@index([weddingId])
}

model SeatAssignment {
  id        String   @id @default(cuid())
  tableId   String
  table     Table    @relation(fields: [tableId], references: [id], onDelete: Cascade)
  guestId   String
  guest     Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)

  assignedAt DateTime @default(now())

  @@unique([tableId, guestId])
  @@unique([guestId])  // Guest can only be at one table
  @@index([tableId])
  @@index([guestId])
}
```

### Wedding Model Update
```prisma
model Wedding {
  // ... existing fields ...
  tables Table[]
}
```

### Guest Model Update
```prisma
model Guest {
  // ... existing fields ...
  seatAssignment SeatAssignment?
}
```

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom mouse/touch handlers | dnd-kit (already installed) | Touch support, accessibility, keyboard navigation all handled |
| PDF export | Canvas-based rendering | Browser print + @media print CSS | Native, zero dependencies, users can save as PDF |
| CSV export | String concatenation | papaparse (already installed) | Proper escaping, header handling |
| Capacity validation | Manual counting | Prisma query with `_count` | Database-level accuracy |

**Key insight:** The seating chart problem is fundamentally about assignment (moving guests to containers) not ordering (sorting within containers). This simplifies the implementation significantly - we only need droppable containers, not sortable lists within them.

## Common Pitfalls

### Pitfall 1: Allowing Assignment of Non-RSVP'd Guests
**What goes wrong:** Couples assign guests who haven't confirmed attendance, leading to incorrect headcounts
**Why it happens:** Not filtering the guest pool by RSVP status
**How to avoid:** Only show guests with `rsvpStatus = ATTENDING` in the assignment interface
**Warning signs:** Guests appearing in seating chart who declined the invitation

### Pitfall 2: Ignoring Plus-Ones in Capacity
**What goes wrong:** Table shows 8/10 guests but actually has 12 people due to plus-ones
**Why it happens:** Counting guests instead of total headcount
**How to avoid:** Calculate: `guests.reduce((sum, g) => sum + 1 + (g.plusOneCount ?? 0), 0)`
**Warning signs:** Venue reports more people than seating chart shows

### Pitfall 3: Touch Scrolling Conflicts
**What goes wrong:** On mobile, trying to scroll the page triggers drag instead
**Why it happens:** Touch sensor captures all touch events by default
**How to avoid:** Use activation constraint with `delay` or `distance` on touch sensor
**Warning signs:** Users can't scroll the page on mobile without accidentally dragging

### Pitfall 4: Lost Assignments on Guest Deletion
**What goes wrong:** Deleting a guest leaves orphaned SeatAssignment records
**Why it happens:** Missing cascade delete
**How to avoid:** Ensure `onDelete: Cascade` on SeatAssignment.guestId relation
**Warning signs:** Database errors or ghost entries in seating chart

### Pitfall 5: Print Layout Breaks Across Pages
**What goes wrong:** Tables get split across print pages mid-table
**Why it happens:** No page break control in CSS
**How to avoid:** Add `page-break-inside: avoid` to table cards
**Warning signs:** Printed seating charts have tables split between pages

## Code Examples

### Server Action: Assign Guest to Table
```typescript
// src/lib/seating/seating-actions.ts
"use server";

import { prisma, withTenantContext } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

interface AssignGuestResult {
  success: boolean;
  error?: string;
}

export async function assignGuestToTable(
  guestId: string,
  tableId: string | null  // null = unassign
): Promise<AssignGuestResult> {
  const session = await auth();
  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  return withTenantContext(session.user.tenantId, async () => {
    // If unassigning, just delete the assignment
    if (!tableId) {
      await prisma.seatAssignment.deleteMany({
        where: { guestId },
      });
      revalidatePath("/dashboard/seating");
      return { success: true };
    }

    // Check table capacity
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        seatAssignments: {
          include: {
            guest: {
              include: {
                eventInvitations: {
                  where: { rsvpStatus: "ATTENDING" },
                  select: { plusOneCount: true },
                },
              },
            },
          },
        },
      },
    });

    if (!table) {
      return { success: false, error: "Table not found" };
    }

    // Get guest being assigned with their plus-one count
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        eventInvitations: {
          where: { rsvpStatus: "ATTENDING" },
          select: { plusOneCount: true },
        },
      },
    });

    if (!guest) {
      return { success: false, error: "Guest not found" };
    }

    // Calculate current headcount at table
    const currentHeadcount = table.seatAssignments.reduce((sum, sa) => {
      const plusOnes = sa.guest.eventInvitations[0]?.plusOneCount ?? 0;
      return sum + 1 + plusOnes;
    }, 0);

    // Calculate new guest's headcount
    const guestHeadcount = 1 + (guest.eventInvitations[0]?.plusOneCount ?? 0);

    if (currentHeadcount + guestHeadcount > table.capacity) {
      return { success: false, error: "Table is at capacity" };
    }

    // Upsert assignment (removes from old table if any)
    await prisma.seatAssignment.upsert({
      where: { guestId },
      create: { tableId, guestId },
      update: { tableId },
    });

    revalidatePath("/dashboard/seating");
    return { success: true };
  });
}
```

### Server Action: Create Table
```typescript
export async function createTable(
  name: string,
  capacity: number
): Promise<{ success: boolean; table?: Table; error?: string }> {
  const session = await auth();
  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  return withTenantContext(session.user.tenantId, async () => {
    // Get wedding
    const wedding = await prisma.wedding.findFirst();
    if (!wedding) {
      return { success: false, error: "No wedding found" };
    }

    // Get max order for new table
    const maxOrder = await prisma.table.aggregate({
      _max: { order: true },
    });

    const table = await prisma.table.create({
      data: {
        weddingId: wedding.id,
        name,
        capacity,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    revalidatePath("/dashboard/seating");
    return { success: true, table };
  });
}
```

### CSV Export Utility
```typescript
// src/lib/seating/export-utils.ts
import Papa from "papaparse";

interface SeatingExportRow {
  tableName: string;
  guestName: string;
  partyName: string | null;
  headcount: number;
  mealChoice: string | null;
  dietaryNotes: string | null;
}

export function generateSeatingCsv(data: SeatingExportRow[]): string {
  const csvData = data.map((row) => ({
    "Table": row.tableName,
    "Guest Name": row.guestName,
    "Party": row.partyName ?? "",
    "Headcount": row.headcount,
    "Meal Choice": row.mealChoice ?? "",
    "Dietary Notes": row.dietaryNotes ?? "",
  }));

  return Papa.unparse(csvData);
}
```

### Guest View: Table Assignment Display
```typescript
// src/app/[domain]/seating/page.tsx
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function GuestSeatingPage({ params }: PageProps) {
  const { domain } = await params;

  // Get wedding and verify RSVP auth
  const wedding = await getWeddingByDomain(domain);
  if (!wedding) notFound();

  const cookieStore = await cookies();
  const guestId = cookieStore.get(`rsvp_guest_${wedding.id}`)?.value;

  if (!guestId) {
    return <NotAuthenticated />;
  }

  // Get guest's table assignment
  const assignment = await getGuestTableAssignment(guestId);

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Table Assignment Pending</h2>
        <p className="text-gray-600">
          Your table assignment will be available closer to the wedding date.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-sm uppercase tracking-wider text-wedding-secondary mb-2">
        Your Table
      </p>
      <h2 className="text-4xl font-wedding-heading text-wedding-primary">
        {assignment.table.name}
      </h2>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | dnd-kit | 2022 | react-beautiful-dnd deprecated, dnd-kit is the replacement |
| HTML5 drag-and-drop API | dnd-kit | N/A | Native API lacks touch support, accessibility |
| PDF libraries for printables | Browser print + @media print | Always | Significantly smaller bundle, native functionality |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated by maintainers, no longer maintained
- window.print() returning Promise: Only Chrome 120+, use void return

## Open Questions

Things that couldn't be fully resolved:

1. **Should tables be event-specific or wedding-wide?**
   - What we know: Different events might have different seating (ceremony vs reception)
   - What's unclear: User research on whether couples want separate charts per event
   - Recommendation: Start with wedding-wide tables, can add event association later if needed

2. **Visual table layout (canvas-based)?**
   - What we know: Some tools offer visual floor plan drag-and-drop
   - What's unclear: Whether this complexity is warranted for MVP
   - Recommendation: Use simple grid/list view first; visual layout is a Phase 10+ enhancement

## Sources

### Primary (HIGH confidence)
- dnd-kit official documentation: https://docs.dndkit.com - multi-container patterns, sensors, accessibility
- Existing project code: SortableSectionList.tsx, MealOptionsEditor.tsx - established patterns
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing - @media print CSS

### Secondary (MEDIUM confidence)
- LogRocket Kanban tutorial: https://blog.logrocket.com/build-kanban-board-dnd-kit-react/ - multi-container patterns
- Radzion Kanban blog: https://radzion.com/blog/kanban/ - onDragOver/onDragEnd patterns

### Tertiary (LOW confidence)
- WebSearch results for wedding seating chart tools - feature inspiration, UX patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Patterns derived from existing project code and official docs
- Database schema: HIGH - Follows existing project conventions
- Pitfalls: MEDIUM - Derived from general dnd-kit patterns and domain knowledge

**Research date:** 2026-01-17
**Valid until:** 2026-03-17 (stable domain, libraries unchanged)
