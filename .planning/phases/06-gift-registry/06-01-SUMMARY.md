---
phase: 06-gift-registry
plan: 01
subsystem: data
tags: [database, prisma, gift-registry, qr-code, payment]
requires:
  - 05-06 (RSVP system complete)
provides:
  - GiftItem and ExternalRegistry database models
  - PaymentSettings typed JSON field on Wedding
  - QR code generation dependencies
affects:
  - 06-02 (registry management uses these models)
  - 06-03 (public view renders from these models)
  - 06-04 (payment QR codes use these packages)
tech-stack:
  added:
    - qrcode.react@4.2.x (QR code rendering)
    - sepa-payment-qr-code@2.0.x (SEPA EPC QR generation)
  patterns:
    - Typed JSON field for payment configuration
    - Separate security-sensitive data from public content
key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - src/types/prisma-json.d.ts
    - package.json
decisions:
  - decision: "Store paymentSettings separately from contentSections"
    rationale: "Payment credentials (IBAN, PayPal username) shouldn't be in publicly-fetched JSON"
  - decision: "GiftItem as separate model (not content section)"
    rationale: "Need claiming status, ordering, and individual item tracking"
  - decision: "Support EUR and CHF currencies"
    rationale: "EPC QR for EUR, text display for CHF (Swiss QR bill would be overkill)"
metrics:
  duration: 6 min
  completed: 2026-01-17
---

# Phase 6 Plan 1: Data Models Summary

Gift registry database schema with GiftItem, ExternalRegistry models and PaymentSettings JSON field, plus QR code package dependencies.

## One-liner

GiftItem/ExternalRegistry models with PaymentSettings typed JSON and qrcode.react/sepa-payment-qr-code packages for payment QR generation.

## Commits

| Hash | Message |
|------|---------|
| a79c80e | feat(06-01): add GiftItem and ExternalRegistry models |
| 1683e14 | feat(06-01): add PaymentSettings TypeScript type |
| 5818eaf | feat(06-01): add QR code dependencies to package.json |

## What Was Built

### 1. GiftItem Model (prisma/schema.prisma)
- `id`, `weddingId` with cascade delete relation
- `name`, `description`, `targetAmount` (Decimal 10,2), `imageUrl`
- `order` for display ordering
- `isClaimed`, `claimedBy`, `claimedAt` for gift claiming
- Indexes on `weddingId` and `[weddingId, isClaimed]`

### 2. ExternalRegistry Model (prisma/schema.prisma)
- `id`, `weddingId` with cascade delete relation
- `name` (registry name like "Amazon"), `url`, `description`
- `order` for display ordering
- Index on `weddingId`

### 3. PaymentSettings JSON Field
- Added `paymentSettings` JSON field to Wedding model
- TypeScript interface in PrismaJson namespace with:
  - `enabled: boolean`
  - `method: 'bank_transfer' | 'paypal' | 'twint' | null`
  - `bankTransfer?: { accountName, iban, bic?, currency: 'EUR' | 'CHF' }`
  - `paypal?: { username, currency? }`
  - `twint?: { displayText, phoneNumber? }`

### 4. QR Code Dependencies (package.json)
- `qrcode.react@^4.2.0` for QR code rendering as SVG/Canvas
- `sepa-payment-qr-code@^2.0.0` for SEPA EPC QR data generation

## Technical Decisions

1. **Separate paymentSettings from contentSections**: Payment credentials shouldn't be in publicly-fetched JSON - stored in dedicated field
2. **GiftItem as database model**: Enables claiming status tracking, ordering, and proper querying vs JSON blob
3. **EUR/CHF currency support**: EPC QR works for EUR, text-based instructions for CHF (Twint/Swiss transfers)

## Verification Results

- [x] `npx prisma validate` passes
- [x] `npx prisma db push` completed
- [x] `npx tsc --noEmit` passes
- [x] GiftItem model has name, description, targetAmount, isClaimed, claimedBy, claimedAt
- [x] ExternalRegistry model has name, url, description, order
- [x] Wedding.paymentSettings JSON field exists
- [x] PaymentSettings type available in PrismaJson namespace
- [x] qrcode.react and sepa-payment-qr-code in package.json dependencies

## Files Changed

| File | Lines | Purpose |
|------|-------|---------|
| prisma/schema.prisma | +45 | GiftItem, ExternalRegistry models, paymentSettings field |
| src/types/prisma-json.d.ts | +28 | PaymentSettings interface |
| package.json | +2 | qrcode.react, sepa-payment-qr-code deps |

## Deviations from Plan

None - plan executed exactly as written.

Note: npm install couldn't execute in sandbox environment. User should run `npm install` to install the new dependencies.

## Next Phase Readiness

Ready for 06-02 (Gift Management UI):
- GiftItem model ready for CRUD operations
- ExternalRegistry model ready for link management
- PaymentSettings type ready for settings form
- QR code packages available after `npm install`
