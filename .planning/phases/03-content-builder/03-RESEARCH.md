# Phase 3: Content Builder - Research

**Researched:** 2026-01-17
**Domain:** Content management, theming, image upload, drag-and-drop reordering, template systems
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 implements a content builder that allows couples to customize their wedding website's appearance and content. The core technical challenges are: (1) designing a flexible schema for templates, theme settings, and content sections, (2) implementing real-time preview of theme changes without excessive server round-trips, (3) handling image uploads for the gallery section, and (4) providing drag-and-drop reordering for content sections.

The recommended approach uses **CSS custom properties (CSS variables)** for dynamic theming with Tailwind CSS, **Prisma JSON fields** with TypeScript typing via `prisma-json-types-generator` for structured content storage, **Vercel Blob** or **UploadThing** for image uploads, and **@dnd-kit/sortable** for drag-and-drop section reordering. The existing patterns from Phases 1-2 (tenant context, server actions, mobile-first Tailwind) will be extended to support content management.

**Primary recommendation:** Use CSS variables for runtime theme switching, store content sections as typed JSON in Prisma, use Vercel Blob for image storage (simpler integration with Vercel deployment), and @dnd-kit for drag-and-drop.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.x | Drag-and-drop foundation | Modern, accessible, lightweight (~10kb), no HTML5 DnD API dependency |
| @dnd-kit/sortable | 8.x | Sortable list preset | Built on dnd-kit/core, handles reordering logic |
| @vercel/blob | latest | Image storage | Native Vercel integration, CDN-backed, no egress fees, S3-compatible |
| prisma-json-types-generator | 3.x | Typed JSON fields | Type-safe JSON content without runtime overhead |
| Tailwind CSS | 3.4.x | Styling with CSS variables | Already installed, supports CSS variable theming |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @uploadthing/react | latest | Alternative file upload | If Vercel Blob limits (4.5MB server upload) are problematic |
| react-colorful | 5.x | Color picker component | Lightweight (2.8kb), accessible color selection for theme customization |
| zod | 3.x | Content validation | Already installed, validate section content structure |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit | @hello-pangea/dnd | hello-pangea has better out-of-box kanban but heavier; dnd-kit more flexible for simple lists |
| @dnd-kit | Native HTML5 DnD | No touch support, poor mobile experience |
| Vercel Blob | Cloudinary | Cloudinary has better transforms but adds external dependency/cost |
| Vercel Blob | UploadThing | UploadThing better for large files (>4.5MB) but adds external service |
| CSS variables | Tailwind themes | CSS variables allow runtime switching; Tailwind themes require rebuild |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @vercel/blob react-colorful
npm install -D prisma-json-types-generator
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (platform)/
│   │   └── dashboard/
│   │       ├── content/           # Content section management
│   │       │   ├── page.tsx       # Section list with drag-and-drop
│   │       │   ├── [section]/     # Section editors
│   │       │   │   └── page.tsx
│   │       │   └── actions.ts     # Server actions for CRUD
│   │       ├── theme/             # Theme customization
│   │       │   ├── page.tsx       # Color/font pickers with preview
│   │       │   └── actions.ts
│   │       └── templates/         # Template selection
│   │           ├── page.tsx
│   │           └── actions.ts
│   └── [domain]/                  # Public wedding site (existing)
│       ├── page.tsx               # Home with theme applied
│       └── sections/              # Section display components
├── components/
│   ├── content-builder/
│   │   ├── SortableSectionList.tsx
│   │   ├── SectionEditor.tsx
│   │   └── editors/               # Per-section-type editors
│   │       ├── EventDetailsEditor.tsx
│   │       ├── OurStoryEditor.tsx
│   │       ├── TravelEditor.tsx
│   │       ├── GalleryEditor.tsx
│   │       ├── TimelineEditor.tsx
│   │       └── ContactEditor.tsx
│   ├── theme/
│   │   ├── ThemeProvider.tsx      # CSS variable injection
│   │   ├── ColorPicker.tsx
│   │   ├── FontSelector.tsx
│   │   └── LivePreview.tsx
│   └── templates/
│       ├── TemplateCard.tsx
│       └── TemplatePreview.tsx
├── lib/
│   └── content/
│       ├── section-types.ts       # TypeScript types for sections
│       ├── templates.ts           # Template definitions
│       └── theme-utils.ts         # CSS variable generation
└── types/
    └── prisma-json.d.ts           # JSON field type declarations
```

### Pattern 1: CSS Variable Theming with Tailwind

**What:** Define theme colors as CSS variables, override them per-tenant at runtime
**When to use:** All theme customization - colors, fonts, spacing

**Example:**
```typescript
// src/lib/content/theme-utils.ts
export interface ThemeSettings {
  primaryColor: string;      // e.g., "#8B5CF6"
  secondaryColor: string;    // e.g., "#EC4899"
  backgroundColor: string;   // e.g., "#FFFFFF"
  textColor: string;         // e.g., "#1F2937"
  accentColor: string;       // e.g., "#10B981"
  fontFamily: string;        // e.g., "Playfair Display"
  headingFont: string;       // e.g., "Great Vibes"
}

export function generateCSSVariables(theme: ThemeSettings): string {
  return `
    --wedding-primary: ${theme.primaryColor};
    --wedding-secondary: ${theme.secondaryColor};
    --wedding-background: ${theme.backgroundColor};
    --wedding-text: ${theme.textColor};
    --wedding-accent: ${theme.accentColor};
    --wedding-font-body: ${theme.fontFamily}, serif;
    --wedding-font-heading: ${theme.headingFont}, cursive;
  `;
}

// src/components/theme/ThemeProvider.tsx
"use client"

import { ThemeSettings, generateCSSVariables } from "@/lib/content/theme-utils"

interface ThemeProviderProps {
  theme: ThemeSettings;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <div style={{ cssText: generateCSSVariables(theme) } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

```css
/* tailwind.config.ts addition */
theme: {
  extend: {
    colors: {
      wedding: {
        primary: "var(--wedding-primary)",
        secondary: "var(--wedding-secondary)",
        background: "var(--wedding-background)",
        text: "var(--wedding-text)",
        accent: "var(--wedding-accent)",
      },
    },
    fontFamily: {
      wedding: "var(--wedding-font-body)",
      "wedding-heading": "var(--wedding-font-heading)",
    },
  },
},
```

### Pattern 2: Typed JSON Content Sections

**What:** Store content sections as JSON with TypeScript typing
**When to use:** All content section data storage

**Example:**
```typescript
// src/types/prisma-json.d.ts
// Used by prisma-json-types-generator
declare global {
  namespace PrismaJson {
    // Base section type
    type ContentSection = {
      id: string;
      type: SectionType;
      order: number;
      isVisible: boolean;
      content: SectionContent;
    };

    type SectionType =
      | "event-details"
      | "our-story"
      | "travel"
      | "gallery"
      | "timeline"
      | "contact";

    // Union of all section content types
    type SectionContent =
      | EventDetailsContent
      | OurStoryContent
      | TravelContent
      | GalleryContent
      | TimelineContent
      | ContactContent;

    type EventDetailsContent = {
      type: "event-details";
      events: Array<{
        name: string;
        date: string;
        time: string;
        location: string;
        address: string;
        dressCode?: string;
        description?: string;
      }>;
    };

    type OurStoryContent = {
      type: "our-story";
      title: string;
      story: string;           // Rich text/markdown
      photos?: string[];       // URLs
    };

    type TravelContent = {
      type: "travel";
      hotels: Array<{
        name: string;
        address: string;
        phone?: string;
        website?: string;
        notes?: string;
        bookingCode?: string;
      }>;
      directions?: string;
      airportInfo?: string;
    };

    type GalleryContent = {
      type: "gallery";
      title: string;
      photos: Array<{
        url: string;
        caption?: string;
        order: number;
      }>;
    };

    type TimelineContent = {
      type: "timeline";
      title: string;
      events: Array<{
        time: string;
        title: string;
        description?: string;
      }>;
    };

    type ContactContent = {
      type: "contact";
      title: string;
      contacts: Array<{
        name: string;
        role: string;           // e.g., "Bride", "Groom", "Wedding Planner"
        email?: string;
        phone?: string;
      }>;
      message?: string;
    };

    // Theme stored as JSON
    type ThemeSettings = {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      headingFont: string;
    };
  }
}

export {};
```

```prisma
// prisma/schema.prisma additions

model Wedding {
  // ... existing fields

  // Template selection
  templateId    String        @default("classic")

  // Theme customization (JSON)
  /// [ThemeSettings]
  themeSettings Json          @default("{}")

  // Content sections (JSON array)
  /// [ContentSection[]]
  contentSections Json        @default("[]")
}
```

### Pattern 3: Drag-and-Drop Section Reordering

**What:** Use @dnd-kit/sortable for reordering content sections
**When to use:** Section list management page

**Example:**
```typescript
// src/components/content-builder/SortableSectionList.tsx
"use client"

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSection } from "./SortableSection";
import { updateSectionOrder } from "@/app/(platform)/dashboard/content/actions";

interface Section {
  id: string;
  type: string;
  order: number;
  isVisible: boolean;
}

export function SortableSectionList({
  initialSections
}: {
  initialSections: Section[]
}) {
  const [sections, setSections] = useState(initialSections);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Persist to server
      await updateSectionOrder(
        newSections.map((s, i) => ({ id: s.id, order: i }))
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              id={section.id}
              type={section.type}
              isVisible={section.isVisible}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

### Pattern 4: Image Upload with Vercel Blob

**What:** Upload images directly to Vercel Blob storage
**When to use:** Gallery section, Our Story photos

**Example:**
```typescript
// src/app/api/upload/route.ts
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Validate file size (4MB limit for server uploads)
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  // Upload to Vercel Blob with tenant-prefixed path
  const blob = await put(
    `${session.user.tenantId}/gallery/${Date.now()}-${file.name}`,
    file,
    { access: "public" }
  );

  return NextResponse.json({ url: blob.url });
}
```

### Pattern 5: Template Definitions

**What:** Define pre-built templates as configurations
**When to use:** Template selection feature

**Example:**
```typescript
// src/lib/content/templates.ts
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme: PrismaJson.ThemeSettings;
  defaultSections: PrismaJson.SectionType[];
}

export const templates: Template[] = [
  {
    id: "classic",
    name: "Classic Elegance",
    description: "Timeless design with elegant typography",
    thumbnail: "/templates/classic-thumb.jpg",
    theme: {
      primaryColor: "#8B5CF6",
      secondaryColor: "#EC4899",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      accentColor: "#10B981",
      fontFamily: "Playfair Display",
      headingFont: "Great Vibes",
    },
    defaultSections: ["event-details", "our-story", "gallery", "travel", "timeline", "contact"],
  },
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean lines and contemporary feel",
    thumbnail: "/templates/modern-thumb.jpg",
    theme: {
      primaryColor: "#000000",
      secondaryColor: "#6B7280",
      backgroundColor: "#FAFAFA",
      textColor: "#111827",
      accentColor: "#3B82F6",
      fontFamily: "Inter",
      headingFont: "Montserrat",
    },
    defaultSections: ["event-details", "our-story", "gallery", "timeline", "contact"],
  },
  {
    id: "rustic",
    name: "Rustic Romance",
    description: "Warm, natural, and inviting",
    thumbnail: "/templates/rustic-thumb.jpg",
    theme: {
      primaryColor: "#92400E",
      secondaryColor: "#B45309",
      backgroundColor: "#FFFBEB",
      textColor: "#78350F",
      accentColor: "#059669",
      fontFamily: "Merriweather",
      headingFont: "Sacramento",
    },
    defaultSections: ["event-details", "our-story", "travel", "gallery", "contact"],
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
```

### Pattern 6: Real-Time Preview Architecture

**What:** Show theme changes immediately without server round-trips
**When to use:** Theme customization page

**Example:**
```typescript
// src/app/(platform)/dashboard/theme/page.tsx
"use client"

import { useState, useTransition } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ColorPicker } from "@/components/theme/ColorPicker";
import { updateTheme } from "./actions";

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
}

export default function ThemeEditorPage({
  initialTheme
}: {
  initialTheme: ThemeSettings
}) {
  const [theme, setTheme] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    // Optimistic update - immediate visual feedback
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateTheme(theme);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Customize Colors</h2>

        <div className="space-y-4">
          <ColorPicker
            label="Primary Color"
            value={theme.primaryColor}
            onChange={(v) => handleColorChange("primaryColor", v)}
          />
          <ColorPicker
            label="Secondary Color"
            value={theme.secondaryColor}
            onChange={(v) => handleColorChange("secondaryColor", v)}
          />
          {/* ... more color pickers */}
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-wedding-primary text-white rounded"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Live Preview Panel */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600">
          Live Preview
        </div>
        <ThemeProvider theme={theme}>
          <div className="p-6 bg-wedding-background min-h-[400px]">
            <h1 className="font-wedding-heading text-4xl text-wedding-primary">
              Sarah & Michael
            </h1>
            <p className="font-wedding text-wedding-text mt-2">
              We&apos;re getting married!
            </p>
            <button className="mt-4 px-4 py-2 bg-wedding-accent text-white rounded">
              RSVP
            </button>
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Storing theme as inline styles:** Use CSS variables for consistency and performance
- **Making DB calls on every color change:** Use client-side state for preview, batch save
- **Large JSON blobs without validation:** Use Zod schemas to validate content structure
- **Uploading to server filesystem:** Use object storage (Vercel Blob) for persistence
- **Custom drag-and-drop implementation:** Use @dnd-kit for accessibility and touch support
- **Rebuilding templates on theme change:** CSS variables allow runtime switching

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop lists | Custom mouse event handlers | @dnd-kit/sortable | Touch support, accessibility, keyboard navigation |
| Color picker | HTML5 color input only | react-colorful | Better UX, alpha support, touch-friendly |
| Image upload | Custom multipart handling | @vercel/blob or UploadThing | CDN delivery, size limits handled, signed URLs |
| Typed JSON | Manual casting everywhere | prisma-json-types-generator | Compile-time safety, IntelliSense |
| CSS theming | Inline styles or class generation | CSS custom properties | Runtime switching, browser optimization |
| Content validation | Manual if/else | Zod schemas | Composable, detailed errors, TypeScript inference |

**Key insight:** Content builders have complex UX requirements (drag-drop, live preview, color picking) that have been solved well by existing libraries. Custom implementations typically lack accessibility and mobile support.

## Common Pitfalls

### Pitfall 1: Vercel Blob 4.5MB Server Upload Limit

**What goes wrong:** Large images fail to upload with 413 error
**Why it happens:** Vercel Functions have 4.5MB request body limit
**How to avoid:**
  - Resize images client-side before upload (use canvas API or library)
  - Use client uploads for larger files: `@vercel/blob/client`
  - Set clear file size limits in UI (< 4MB recommended)
  - Consider UploadThing for galleries expecting large files
**Warning signs:** 413 Payload Too Large errors in production

### Pitfall 2: React 19 dnd-kit Compatibility

**What goes wrong:** Hydration errors or "use client" missing errors
**Why it happens:** dnd-kit components need client-side rendering; React 19 changes
**How to avoid:**
  - Always add "use client" to drag-and-drop components
  - Keep DndContext at component level, not layout level
  - Test thoroughly with React 19 before deploying
**Warning signs:** Hydration mismatch errors, components not rendering

### Pitfall 3: JSON Schema Migration

**What goes wrong:** Existing content breaks after adding new section fields
**Why it happens:** JSON fields don't have schema migrations like relational columns
**How to avoid:**
  - Always provide default values for new fields in TypeScript types
  - Use Zod `.optional()` or `.default()` for new fields
  - Create migration scripts for structural changes
  - Consider versioning content schema in the JSON
**Warning signs:** TypeScript errors when reading old content, null field access

### Pitfall 4: CSS Variable Performance in Lists

**What goes wrong:** Slow rendering when many elements read CSS variables
**Why it happens:** CSS variable lookup happens at render time
**How to avoid:**
  - Set variables at a high level (not per-item)
  - Use Tailwind's theme extension, not inline style injection
  - Avoid computed CSS values in tight loops
**Warning signs:** Slow theme preview updates, laggy color picker

### Pitfall 5: Image URL Expiration

**What goes wrong:** Gallery images stop loading after time
**Why it happens:** Vercel Blob URLs with restricted access can expire
**How to avoid:**
  - Use `access: "public"` for wedding photos (they're shared anyway)
  - Store permanent URLs in database, not signed URLs
  - Implement proper tenant isolation at storage path level
**Warning signs:** 403 errors on images, broken gallery after days

### Pitfall 6: Font Loading FOUC

**What goes wrong:** Flash of unstyled content when custom fonts load
**Why it happens:** Custom fonts download after initial render
**How to avoid:**
  - Use `next/font` for optimized font loading with preload
  - Provide system font fallbacks in CSS
  - Consider limiting font choices to pre-loaded fonts
**Warning signs:** Text jumps on page load, layout shifts

## Code Examples

Verified patterns from official sources:

### Server Action for Content Section Update

```typescript
// src/app/(platform)/dashboard/content/actions.ts
"use server"

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sectionOrderSchema = z.array(z.object({
  id: z.string(),
  order: z.number(),
}));

export async function updateSectionOrder(
  sections: { id: string; order: number }[]
) {
  const session = await auth();

  if (!session?.user.tenantId) {
    throw new Error("Unauthorized");
  }

  const validated = sectionOrderSchema.parse(sections);

  await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst();
    if (!wedding) throw new Error("Wedding not found");

    // Update order in JSON content
    const currentSections = wedding.contentSections as PrismaJson.ContentSection[];
    const updatedSections = currentSections.map((section) => {
      const newOrder = validated.find((v) => v.id === section.id);
      return newOrder ? { ...section, order: newOrder.order } : section;
    });

    // Sort by new order
    updatedSections.sort((a, b) => a.order - b.order);

    await prisma.wedding.update({
      where: { id: wedding.id },
      data: { contentSections: updatedSections },
    });
  });

  revalidatePath("/dashboard/content");
}
```

### Prisma Generator Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator jsonTypes {
  provider = "prisma-json-types-generator"
}

// ... rest of schema
```

### SortableSection Component

```typescript
// src/components/content-builder/SortableSection.tsx
"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface SortableSectionProps {
  id: string;
  type: string;
  isVisible: boolean;
  onToggleVisibility?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const sectionLabels: Record<string, string> = {
  "event-details": "Event Details",
  "our-story": "Our Story",
  "travel": "Travel & Hotels",
  "gallery": "Photo Gallery",
  "timeline": "Day-of Timeline",
  "contact": "Contact Info",
};

export function SortableSection({
  id,
  type,
  isVisible,
  onToggleVisibility,
  onDelete,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-white border rounded-lg
        ${isDragging ? "shadow-lg" : "shadow-sm"}
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>

      {/* Section info */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">
          {sectionLabels[type] || type}
        </h3>
        <p className="text-sm text-gray-500">
          {isVisible ? "Visible to guests" : "Hidden"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleVisibility?.(id)}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label={isVisible ? "Hide section" : "Show section"}
        >
          {isVisible ? (
            <Eye className="w-5 h-5 text-gray-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <Link
          href={`/dashboard/content/${type}`}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Edit section"
        >
          <Pencil className="w-5 h-5 text-gray-600" />
        </Link>

        <button
          onClick={() => onDelete?.(id)}
          className="p-2 hover:bg-red-100 rounded"
          aria-label="Delete section"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
}
```

### Public Wedding Site with Theme

```typescript
// src/app/[domain]/page.tsx (updated)
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ContentSection } from "@/components/content/ContentSection";

export default async function WeddingSite({
  params
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: { wedding: true },
  });

  if (!tenant?.wedding) {
    notFound();
  }

  const { wedding } = tenant;
  const theme = wedding.themeSettings as PrismaJson.ThemeSettings;
  const sections = (wedding.contentSections as PrismaJson.ContentSection[])
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <ThemeProvider theme={theme}>
      <main className="min-h-screen bg-wedding-background">
        {/* Hero */}
        <section className="py-20 text-center">
          <h1 className="font-wedding-heading text-5xl md:text-7xl text-wedding-primary">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>
          {wedding.weddingDate && (
            <p className="mt-4 font-wedding text-xl text-wedding-text">
              {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </section>

        {/* Dynamic sections */}
        {sections.map((section) => (
          <ContentSection key={section.id} section={section} />
        ))}
      </main>
    </ThemeProvider>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit or @hello-pangea/dnd | 2022 (Atlassian deprecated) | Better maintenance, React 18/19 support |
| Styled-components themes | CSS custom properties + Tailwind | 2023-2024 | No runtime, better performance |
| CMS for content | JSON in Prisma + typed generator | 2024 | Simpler stack, no external CMS |
| S3 direct upload | Vercel Blob / UploadThing | 2024 | Integrated CDN, simpler setup |
| Untyped JSON fields | prisma-json-types-generator | 2023-2024 | Type safety without overhead |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated by Atlassian in 2022, use dnd-kit or hello-pangea/dnd
- Class-based theming: CSS variables preferred for runtime switching
- Server-side image processing: Use CDN transforms (Vercel Image, Cloudinary)
- Separate CMS service: For wedding platform scope, JSON in Prisma is sufficient

## Open Questions

Things that couldn't be fully resolved:

1. **dnd-kit React 19 stability**
   - What we know: There's an open issue (#1654) for "use client" directive
   - What's unclear: Whether current version works seamlessly with React 19
   - Recommendation: Test early, keep fallback to non-drag interface

2. **Image optimization strategy**
   - What we know: Vercel Image Optimization works with Blob URLs
   - What's unclear: Best approach for gallery thumbnails at scale
   - Recommendation: Use `next/image` with Vercel Blob URLs, monitor performance

3. **Font hosting**
   - What we know: Google Fonts has privacy concerns in EU
   - What's unclear: Whether to self-host fonts or use Google Fonts
   - Recommendation: Use `next/font` which self-hosts Google Fonts automatically

## Sources

### Primary (HIGH confidence)
- [Vercel Blob Documentation](https://vercel.com/docs/vercel-blob) - Official upload patterns
- [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme) - CSS variable theming
- [Prisma JSON Fields](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields) - JSON handling
- [dnd-kit GitHub](https://github.com/clauderic/dnd-kit) - Drag-and-drop library

### Secondary (MEDIUM confidence)
- [UploadThing Documentation](https://docs.uploadthing.com/getting-started/appdir) - Alternative upload solution
- [prisma-json-types-generator](https://github.com/arthurfiorette/prisma-json-types-generator) - Type-safe JSON
- [Top 5 Drag-and-Drop Libraries for React](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Library comparison
- [Type-Safe Theming in Tailwind CSS](https://dev.to/abtahitajwar/type-safe-theming-in-tailwind-css-using-css-variables-and-typescript-1e6j) - Theming patterns

### Tertiary (LOW confidence)
- WebSearch results for React 19 dnd-kit compatibility - Community feedback
- WebSearch results for content builder architecture - General patterns

## Metadata

**Confidence breakdown:**
- Schema design: HIGH - Well-established Prisma patterns
- CSS variable theming: HIGH - Official Tailwind approach
- Image upload: HIGH - Official Vercel Blob documentation
- Drag-and-drop: MEDIUM - React 19 compatibility unclear
- Template system: MEDIUM - Custom implementation following common patterns
- Real-time preview: MEDIUM - Standard React patterns, no official guide

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (dnd-kit may stabilize React 19 support, check for updates)
