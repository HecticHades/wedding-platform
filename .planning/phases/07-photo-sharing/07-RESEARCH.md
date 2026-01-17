# Phase 7: Photo Sharing - Research

**Researched:** 2026-01-17
**Domain:** Wedding photo sharing with guest uploads, QR code access, and moderation workflow
**Confidence:** HIGH

## Summary

This phase implements a wedding photo sharing system where couples share wedding photos and guests upload their own photos from the event. The core features are: couple photo gallery (building on existing GallerySection), guest photo uploads via QR code access, and a moderation workflow for couple approval of guest photos before public display.

The architecture leverages existing infrastructure: Vercel Blob for storage (already configured), qrcode.react for QR generation (already installed), and the established pattern of tenant-scoped data with cookie-based guest authentication (from Phase 5 RSVP). The key addition is a database model for guest photos with moderation status, and a client-side upload flow that bypasses the 4.5MB serverless function limit.

**Primary recommendation:** Use Vercel Blob client uploads with `handleUpload` for guest photo uploads (supports files larger than 4.5MB), store photos in a new `GuestPhoto` model with moderation status, and generate QR codes linking to the wedding's photo upload page. Leverage yet-another-react-lightbox for enhanced gallery viewing.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vercel/blob | ^2.0.0 | File storage with client upload support | Already in use, supports multipart uploads to 5TB |
| qrcode.react | ^4.2.0 | QR code rendering for photo upload links | Already installed for payment QR codes in Phase 6 |
| next/image | Built-in | Optimized image rendering | Standard Next.js image component |

### Supporting (New)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| yet-another-react-lightbox | ^3.x | Full-screen gallery viewing with navigation | For enhanced photo viewing experience |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| yet-another-react-lightbox | lightbox.js | lightbox.js has SSR support but smaller community |
| yet-another-react-lightbox | Built-in modal | Custom build is more work, less features (zoom, swipe) |
| Simple moderation | AI moderation (AWS Rekognition) | AI adds cost/complexity, manual review is sufficient for weddings |

**Installation:**
```bash
npm install yet-another-react-lightbox
```

## Architecture Patterns

### Database Schema Extension

Add GuestPhoto model for storing guest-uploaded photos with moderation status:

```prisma
model GuestPhoto {
  id          String   @id @default(cuid())
  weddingId   String
  wedding     Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  url         String              // Vercel Blob URL
  caption     String?             // Optional caption from guest
  uploadedBy  String?             // Guest name (optional)

  // Moderation
  status      PhotoStatus @default(PENDING)
  reviewedAt  DateTime?

  // Metadata
  uploadedAt  DateTime @default(now())

  @@index([weddingId])
  @@index([weddingId, status])
}

enum PhotoStatus {
  PENDING    // Awaiting couple review
  APPROVED   // Visible in gallery
  REJECTED   // Hidden from gallery
}
```

Update Wedding model to track photo sharing settings:

```prisma
model Wedding {
  // ... existing fields ...

  // Photo sharing settings
  photoSharingEnabled Boolean @default(false)
  photoUploadCode     String? @unique  // Separate code for photo uploads (optional, can reuse rsvpCode)

  // Relations
  guestPhotos GuestPhoto[]
}
```

### Recommended Project Structure

```
src/
├── components/
│   └── photos/
│       ├── PhotoGallery.tsx           # Combined gallery (couple + approved guest photos)
│       ├── PhotoCard.tsx              # Individual photo display
│       ├── PhotoLightbox.tsx          # Full-screen viewer with yet-another-react-lightbox
│       ├── GuestUploader.tsx          # Upload form for guests
│       ├── PhotoModerationList.tsx    # Couple's moderation queue
│       ├── PhotoModerationCard.tsx    # Single photo with approve/reject actions
│       └── PhotoUploadQRCode.tsx      # QR code for photo upload page
├── lib/
│   └── photos/
│       ├── photo-utils.ts             # Photo helpers (URL generation, etc.)
│       └── moderation-utils.ts        # Moderation status helpers
└── app/
    ├── (platform)/
    │   └── dashboard/
    │       └── photos/
    │           ├── page.tsx           # Photo management overview
    │           ├── actions.ts         # Server actions for uploads/moderation
    │           ├── upload/
    │           │   └── page.tsx       # Couple's upload interface
    │           ├── moderation/
    │           │   └── page.tsx       # Moderation queue
    │           └── settings/
    │               └── page.tsx       # Photo sharing settings & QR code
    ├── [domain]/
    │   └── photos/
    │       ├── page.tsx               # Public photo gallery
    │       └── upload/
    │           ├── page.tsx           # Guest upload page (QR code destination)
    │           └── actions.ts         # Guest upload server actions
    └── api/
        └── photos/
            └── upload/
                └── route.ts           # Client upload handler (handleUpload)
```

### Pattern 1: Client Upload with Vercel Blob (Bypasses 4.5MB Limit)

**What:** Enable direct browser-to-blob uploads for larger photos
**When to use:** Guest photo uploads (phones often produce 5-10MB photos)
**Example:**

```typescript
// src/app/api/photos/upload/route.ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // clientPayload contains weddingId and guestName from client
        const payload = clientPayload ? JSON.parse(clientPayload) : {};

        // Validate wedding exists and photo sharing is enabled
        const wedding = await prisma.wedding.findUnique({
          where: { id: payload.weddingId },
          select: { photoSharingEnabled: true },
        });

        if (!wedding?.photoSharingEnabled) {
          throw new Error("Photo sharing is not enabled");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB limit for high-res photos
          addRandomSuffix: true,
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Create GuestPhoto record after successful upload
        const payload = tokenPayload ? JSON.parse(tokenPayload) : {};

        await prisma.guestPhoto.create({
          data: {
            weddingId: payload.weddingId,
            url: blob.url,
            uploadedBy: payload.guestName || "Anonymous",
            status: "PENDING",
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

```typescript
// Client-side upload component
"use client";

import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";

interface GuestUploaderProps {
  weddingId: string;
}

export function GuestUploader({ weddingId }: GuestUploaderProps) {
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/photos/upload",
          clientPayload: JSON.stringify({
            weddingId,
            guestName: guestName || "Anonymous",
          }),
        });
        setUploadCount((c) => c + 1);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg"
      >
        {isUploading ? "Uploading..." : "Select Photos to Upload"}
      </button>
      {uploadCount > 0 && (
        <p className="text-green-600">{uploadCount} photo(s) uploaded!</p>
      )}
    </div>
  );
}
```

### Pattern 2: QR Code for Photo Upload Access

**What:** Generate QR code that links to the wedding's photo upload page
**When to use:** Printed on table cards, displayed at reception
**Example:**

```typescript
// src/components/photos/PhotoUploadQRCode.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";

interface PhotoUploadQRCodeProps {
  subdomain: string;
  className?: string;
}

export function PhotoUploadQRCode({ subdomain, className }: PhotoUploadQRCodeProps) {
  // Generate URL to the photo upload page
  const uploadUrl = `https://${subdomain}.yourdomain.com/photos/upload`;
  // Or for development: `http://${subdomain}.localhost:3000/photos/upload`

  return (
    <div className={className}>
      <QRCodeSVG
        value={uploadUrl}
        size={200}
        level="M"  // Medium error correction - good for print
        includeMargin
        className="mx-auto"
      />
      <p className="text-center mt-2 text-sm text-gray-600">
        Scan to share your photos
      </p>
    </div>
  );
}
```

### Pattern 3: Simple Manual Moderation Workflow

**What:** Couple reviews pending photos, approves or rejects
**When to use:** Pre-publishing moderation (safer, recommended default)
**Example:**

```typescript
// src/app/(platform)/dashboard/photos/actions.ts
"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function moderatePhoto(
  photoId: string,
  action: "approve" | "reject"
) {
  const session = await auth();
  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify photo belongs to user's wedding
  const photo = await prisma.guestPhoto.findFirst({
    where: {
      id: photoId,
      wedding: { tenantId: session.user.tenantId },
    },
  });

  if (!photo) {
    return { success: false, error: "Photo not found" };
  }

  await prisma.guestPhoto.update({
    where: { id: photoId },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/photos/moderation");
  revalidatePath("/[domain]/photos");

  return { success: true };
}

export async function bulkModerate(
  photoIds: string[],
  action: "approve" | "reject"
) {
  const session = await auth();
  if (!session?.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.guestPhoto.updateMany({
    where: {
      id: { in: photoIds },
      wedding: { tenantId: session.user.tenantId },
    },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/photos/moderation");
  revalidatePath("/[domain]/photos");

  return { success: true };
}
```

### Pattern 4: Enhanced Gallery with Lightbox

**What:** Full-screen photo viewing with navigation and zoom
**When to use:** Public photo gallery page
**Example:**

```typescript
// src/components/photos/PhotoLightbox.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface Photo {
  url: string;
  caption?: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function PhotoLightbox({
  photos,
  initialIndex = 0,
  open,
  onClose,
}: PhotoLightboxProps) {
  const slides = photos.map((photo) => ({
    src: photo.url,
    alt: photo.caption || "Wedding photo",
    title: photo.caption,
  }));

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={initialIndex}
      plugins={[Zoom, Thumbnails]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
    />
  );
}
```

### Anti-Patterns to Avoid

- **Server-side uploads for large files:** Vercel Functions have 4.5MB body limit; use client uploads for guest photos
- **No moderation at all:** Guest photos should be reviewed before public display to prevent inappropriate content
- **Storing photos in JSON field:** Use a proper database table (GuestPhoto) for queryability and moderation status
- **Automatic approval:** Default to PENDING status; let couples opt-in to auto-approve if desired
- **Blocking on `onUploadCompleted`:** This callback may not fire locally (needs ngrok); handle gracefully

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Custom pixel rendering | qrcode.react (already installed) | Complex algorithm, error correction |
| Client uploads > 4.5MB | Chunked upload system | Vercel Blob client upload | Built-in multipart, retries |
| Lightbox gallery | Custom modal with gestures | yet-another-react-lightbox | Swipe, zoom, keyboard nav, accessibility |
| Image optimization | Manual resizing | Next.js Image component | Automatic optimization, lazy loading |
| HEIC conversion | Server-side conversion | Browser/OS handles display | Modern browsers support HEIC; let them handle it |

**Key insight:** The complexity is in the upload flow (client tokens, callbacks) and moderation UX, not in storage or display.

## Common Pitfalls

### Pitfall 1: Vercel Function Body Size Limit
**What goes wrong:** Guest uploads fail for photos larger than 4.5MB
**Why it happens:** Serverless functions have body size limits
**How to avoid:** Use Vercel Blob client uploads with `handleUploadUrl` pattern
**Warning signs:** "Request body too large" errors in production

### Pitfall 2: onUploadCompleted Not Firing Locally
**What goes wrong:** Photos upload but don't appear in database during local dev
**Why it happens:** Vercel can't call back to localhost
**How to avoid:** Use ngrok for local development OR handle missing records gracefully
**Warning signs:** Photos in Blob storage but not in database

```typescript
// Alternative: Poll for photos on gallery page if callback missed
// Or use a fallback server action after upload completes
```

### Pitfall 3: Missing Next.js Image Remote Patterns
**What goes wrong:** Images don't load, "hostname not allowed" error
**Why it happens:** Next.js requires explicit allowlist for remote images
**How to avoid:** Configure remotePatterns in next.config.ts for Vercel Blob

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};
```

### Pitfall 4: Race Condition in Photo Gallery Display
**What goes wrong:** Recently approved photos don't appear immediately
**Why it happens:** Page caching / stale data
**How to avoid:** Use `revalidatePath` after moderation actions, consider optimistic UI
**Warning signs:** Photos appear after page refresh but not immediately

### Pitfall 5: Mobile HEIC Photo Format
**What goes wrong:** iPhone photos don't preview correctly
**Why it happens:** HEIC is Apple's format, not universally supported
**How to avoid:** Accept HEIC in upload, but convert on display OR rely on Vercel Blob's CDN
**Warning signs:** Broken images on Android browsers for iPhone uploads

```typescript
// Accept HEIC but also accept converted formats
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
```

### Pitfall 6: QR Code Too Small to Scan
**What goes wrong:** Guests can't scan QR code from table cards
**Why it happens:** QR code rendered at small size for print
**How to avoid:** Minimum 1 inch (2.5cm) print size, use level "M" error correction
**Warning signs:** QR code fails to scan from printed materials

## Code Examples

Verified patterns from official sources:

### Vercel Blob Client Upload with Token Exchange
```typescript
// Source: https://vercel.com/docs/vercel-blob/client-upload
import { upload } from "@vercel/blob/client";

const newBlob = await upload(file.name, file, {
  access: "public",
  handleUploadUrl: "/api/photos/upload",
  clientPayload: JSON.stringify({ weddingId, guestName }),
});
// newBlob.url contains the uploaded file URL
```

### qrcode.react with Custom Styling
```typescript
// Source: https://github.com/zpao/qrcode.react
import { QRCodeSVG } from "qrcode.react";

<QRCodeSVG
  value="https://wedding.example.com/photos/upload"
  size={256}
  level="M"           // L, M, Q, H - error correction
  bgColor="#FFFFFF"
  fgColor="#000000"
  includeMargin={true}
/>
```

### yet-another-react-lightbox with Next.js Image
```typescript
// Source: https://yet-another-react-lightbox.com/examples/nextjs
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Custom render function for Next.js Image optimization
const renderSlide = ({ slide }) => (
  <Image
    src={slide.src}
    alt={slide.alt || ""}
    fill
    sizes="100vw"
    style={{ objectFit: "contain" }}
    priority
  />
);

<Lightbox
  open={open}
  close={() => setOpen(false)}
  slides={slides}
  render={{ slide: renderSlide }}
/>
```

### Photo Moderation Status Badge
```typescript
// Simple status display pattern
const statusConfig = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

function StatusBadge({ status }: { status: PhotoStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side file upload | Client-side direct-to-storage | 2023-2024 | Bypass serverless limits, better UX |
| Download dedicated app | QR code to web page | 2020+ | No app install friction |
| Manual email collection | Real-time upload + moderation | 2022+ | Instant photo sharing |
| Post-event photo dump | Live upload during event | 2023+ | Engagement during reception |

**Deprecated/outdated:**
- Requiring guests to download an app (23% completion rate vs 80%+ for QR web)
- Server-side upload for mobile photos (hits size limits)
- No moderation (risk of inappropriate content)

## Open Questions

Things that couldn't be fully resolved:

1. **Auto-approve Option**
   - What we know: Default to PENDING is safer
   - What's unclear: Should couples have option to auto-approve all uploads?
   - Recommendation: Add photoAutoApprove boolean to settings, default false

2. **Photo Download Feature**
   - What we know: Guests might want to download photos
   - What's unclear: Should there be a "download all" feature?
   - Recommendation: Allow individual downloads, defer bulk download to future

3. **Guest Upload Limits**
   - What we know: Need to prevent abuse
   - What's unclear: What's reasonable limit per guest?
   - Recommendation: Start with 20 photos per session, no hard enforcement

4. **Local Development Testing**
   - What we know: onUploadCompleted requires public URL
   - What's unclear: Best dev experience without ngrok
   - Recommendation: Create fallback flow that creates photo record client-side after upload

## Sources

### Primary (HIGH confidence)
- [Vercel Blob Client Uploads](https://vercel.com/docs/vercel-blob/client-upload) - handleUpload pattern, token exchange
- [qrcode.react GitHub](https://github.com/zpao/qrcode.react) - QR code props, rendering options
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/examples/nextjs) - Next.js integration
- Existing codebase: src/app/api/upload/route.ts, src/components/registry/PaymentQRCode.tsx

### Secondary (MEDIUM confidence)
- [Vercel Blob Multipart Uploads](https://vercel.com/changelog/5tb-file-transfers-with-vercel-blob-multipart-uploads) - Large file support
- Wedding photo sharing app research - UX patterns for QR code access

### Tertiary (LOW confidence)
- WebSearch: Wedding photo app best practices (community patterns)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing installed packages + one well-documented addition
- Architecture: HIGH - Follows established project patterns exactly
- Client uploads: HIGH - Official Vercel documentation with code examples
- Moderation workflow: HIGH - Simple CRUD pattern, no external dependencies
- Pitfalls: MEDIUM - Based on Vercel docs and common Next.js issues

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable domain)
