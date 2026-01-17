# Phase 7 Plan 3: Public Gallery & Guest Upload Summary

**One-liner:** Guest photo upload with client-side large file support and public gallery with lightbox viewing.

## What Was Built

### Public Photo Gallery (`/photos`)
- **Gallery page** displays couple photos from gallery content section + approved guest photos
- **PhotoGallery component** combines all photos in responsive grid (1/2/3 cols)
- **PhotoCard component** with hover effects, guest photo badge, caption overlay
- **PhotoLightbox** using yet-another-react-lightbox with zoom and thumbnails plugins
- Photo count stats and empty state with upload CTA

### Guest Upload Page (`/photos/upload`)
- **QR code destination** for mobile photo sharing at events
- **GuestUploader component** with multi-file selection
- Client-side upload using Vercel Blob client API
- Progress indicators, success/error feedback
- Optional guest name input
- Checks photoSharingEnabled flag

### Client Upload API (`/api/photos/upload`)
- **Vercel Blob handleUpload** pattern for client-side uploads
- Bypasses 4.5MB serverless limit - supports up to 20MB per photo
- Validates wedding exists and photo sharing is enabled
- Creates GuestPhoto record with PENDING status in onUploadCompleted callback
- Fallback server action for local dev where webhook doesn't fire

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 84619ad | feat | Add client upload API for guest photos |
| 1b05512 | feat | Add guest photo upload page and uploader |
| 468829b | feat | Add public photo gallery with lightbox |

## Files Changed

| File | Changes |
|------|---------|
| src/app/api/photos/upload/route.ts | Client upload handler with handleUpload |
| src/app/[domain]/photos/upload/actions.ts | Fallback server action for local dev |
| src/app/[domain]/photos/upload/page.tsx | Guest upload page (QR destination) |
| src/app/[domain]/photos/page.tsx | Public photo gallery page |
| src/components/photos/GuestUploader.tsx | Multi-file uploader component |
| src/components/photos/PhotoGallery.tsx | Combined gallery with lightbox state |
| src/components/photos/PhotoCard.tsx | Photo card with guest badge |
| src/components/photos/PhotoLightbox.tsx | Lightbox wrapper with zoom/thumbnails |

## Verification Results

- [x] Guest can access `/photos` page and see photo gallery
- [x] Gallery shows couple photos from existing gallery content section
- [x] Gallery shows approved guest photos mixed with couple photos
- [x] Clicking any photo opens full-screen lightbox
- [x] Lightbox has zoom and swipe navigation on mobile
- [x] Guest can access `/photos/upload` page via QR code URL
- [x] Guest can enter their name (optional) and select photos
- [x] Upload supports large files (20MB limit vs 4.5MB serverless limit)
- [x] Uploaded photos created with PENDING status
- [x] TypeScript compiles without errors

## Key Patterns

### Client Upload Flow
```
Guest selects files
  -> GuestUploader calls upload() from @vercel/blob/client
  -> Request goes to /api/photos/upload
  -> handleUpload.onBeforeGenerateToken validates wedding + returns token
  -> Vercel Blob receives file directly from client
  -> handleUpload.onUploadCompleted creates GuestPhoto record
  -> (fallback) createGuestPhotoRecord action for local dev
```

### Photo Sources Combined
```
Gallery Page
  |-- Couple Photos (from contentSections[type=gallery])
  |-- Guest Photos (from GuestPhoto where status=APPROVED)
  --> Merged into single array for PhotoGallery
```

## Deviations from Plan

None - plan executed exactly as written.

## Duration

~6 minutes

## Next Steps

Phase 07-02 (Photo Moderation Dashboard) will add:
- Couple-facing photo moderation page
- Approve/reject actions for pending photos
- Bulk moderation controls
