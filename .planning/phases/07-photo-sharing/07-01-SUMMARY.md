# Phase 7 Plan 1: Photo Sharing Schema Setup Summary

**One-liner:** GuestPhoto model with moderation workflow, lightbox dependency, and Vercel Blob image config.

## What Was Built

### Database Schema
- **PhotoStatus enum:** PENDING, APPROVED, REJECTED for moderation workflow
- **GuestPhoto model:** Stores guest-uploaded photos with Vercel Blob URLs
  - Fields: id, weddingId, url, caption, uploadedBy, status, reviewedAt, uploadedAt
  - Indexes: weddingId, weddingId+status (for efficient gallery queries)
- **Wedding.photoSharingEnabled:** Boolean flag to enable/disable feature per wedding
- **Wedding.guestPhotos relation:** Links wedding to all guest photos

### Dependencies
- **yet-another-react-lightbox ^3.21.7:** Full-featured gallery lightbox
  - Full-screen viewing
  - Swipe navigation on mobile
  - Zoom capability
  - Keyboard navigation

### Configuration
- **next.config.ts:** Added remotePatterns for `*.public.blob.vercel-storage.com`
  - Required for Next.js Image component to render Vercel Blob URLs
  - Without this, gallery images would fail with "hostname not allowed"

### Types
- **PhotoSettings interface:** Added to prisma-json.d.ts for future use
  - enabled, allowGuestUploads, requireModeration fields

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 64361e5 | chore | Add yet-another-react-lightbox dependency |
| 5e96e97 | feat | Add GuestPhoto model with moderation workflow |
| 44a6e50 | feat | Configure Next.js Image for Vercel Blob URLs |

## Files Changed

| File | Changes |
|------|---------|
| package.json | Added yet-another-react-lightbox dependency |
| prisma/schema.prisma | Added PhotoStatus enum, GuestPhoto model, Wedding.photoSharingEnabled |
| src/types/prisma-json.d.ts | Added PhotoSettings interface |
| next.config.ts | Added remotePatterns for Vercel Blob |

## Verification Results

- [x] yet-another-react-lightbox in package.json
- [x] GuestPhoto model with PhotoStatus enum in schema
- [x] Wedding.photoSharingEnabled field added
- [x] guestPhotos relation connects Wedding to GuestPhoto
- [x] Vercel Blob hostname in next.config.ts remotePatterns
- [x] Prisma validate passes

## Deviations from Plan

None - plan executed exactly as written.

## Duration

~5 minutes

## Next Steps

Plan 07-02 will implement the photo upload API and gallery components.
