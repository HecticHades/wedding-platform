---
phase: 06-gift-registry
plan: 04
subsystem: public-registry
tags: [qr-code, payment, guest-experience, gift-claiming]
requires:
  - 06-02 (Gift management UI and GiftItem model)
  - 06-03 (Payment settings configuration)
provides:
  - Public gift registry page for guests
  - Payment QR code generation (EPC for EUR, PayPal.me links)
  - Gift claiming with atomic updates
  - Direct gift links for sharing
affects:
  - Future phases may add payment confirmation tracking
tech-stack:
  added: []
  patterns:
    - EPC QR code for SEPA bank transfers (EUR only)
    - PayPal.me link QR with clickable fallback
    - Twint display instructions (no QR for personal use)
    - Atomic updateMany for race condition prevention
key-files:
  created:
    - src/lib/registry/payment-utils.ts
    - src/components/registry/PaymentQRCode.tsx
    - src/components/registry/PublicGiftList.tsx
    - src/components/registry/PaymentModal.tsx
    - src/app/[domain]/registry/page.tsx
    - src/app/[domain]/registry/actions.ts
    - src/app/[domain]/registry/[giftId]/page.tsx
    - src/app/[domain]/registry/[giftId]/GiftDetailClient.tsx
  modified: []
decisions:
  - decision: "EPC QR for EUR, text display for CHF bank transfers"
    rationale: "EPC standard only supports EUR; Swiss QR bill would be overkill for simple peer-to-peer"
  - decision: "Two-step claiming flow (payment -> name confirmation)"
    rationale: "Separates payment viewing from commitment; allows anonymous or named claims"
  - decision: "Optimistic local state for claimed gifts"
    rationale: "Immediate UI feedback while server confirms; prevents double-selection"
metrics:
  duration: 8 min
  completed: 2026-01-17
---

# Phase 6 Plan 4: Payment QR Codes Summary

Public gift registry page where guests can browse gifts and receive payment QR codes for contribution.

## One-liner

QR code generation for EUR bank transfers (EPC), PayPal.me links, and Twint instructions with atomic gift claiming.

## Commits

| Hash | Message |
|------|---------|
| f617b19 | feat(06-04): add payment utilities and QR code component |
| cfbfdda | feat(06-04): add public registry page and gift list |
| 79b10d4 | feat(06-04): add payment modal and gift detail page |

## What Was Built

### 1. Payment Utilities

**payment-utils.ts:**
- `generateQRCodeData(paymentSettings, amount, reference)` - Returns QR code data string or null
- Handles three payment methods:
  - Bank transfer (EUR): Uses `sepa-payment-qr-code` for EPC QR data
  - Bank transfer (CHF): Returns formatted text (no EPC support)
  - PayPal: Generates `https://paypal.me/{username}/{amount}{currency}` URL
  - Twint: Returns null (show instructions instead)
- `getPaymentMethodLabel(method)` - Human-readable payment method names

### 2. PaymentQRCode Component

**PaymentQRCode.tsx:**
- Renders `QRCodeSVG` from qrcode.react (256px, level M)
- Handles method-specific display:
  - EUR bank transfer: Scannable EPC QR code
  - CHF bank transfer: Text box with transfer details
  - PayPal: QR code + clickable "Or click here" link
  - Twint: Instructions panel with phone number
- Graceful fallback when payment not configured

### 3. Public Registry Page

**[domain]/registry/page.tsx:**
- Server component fetching gifts and external registries
- Groups gifts (available first, then claimed)
- Displays external registry cards as links
- Empty state when registry not configured
- Back link to wedding site

**PublicGiftList.tsx:**
- Client component with gift card grid (1/2/3 cols)
- Available vs claimed visual differentiation
- "Select This Gift" button opens PaymentModal
- Optimistic UI update after claiming
- Summary stats (X available, Y claimed)

### 4. Gift Claiming Flow

**actions.ts:**
- `claimGift(giftId, guestName?)` - Atomic claim with race condition prevention
- Uses `updateMany` with `isClaimed: false` condition
- Returns error if already claimed
- Revalidates registry path

**PaymentModal.tsx:**
- Two-step modal flow:
  1. Payment step: Shows QR code, "I've Made the Payment" button
  2. Confirm step: Optional name input, "Confirm & Reserve Gift" button
- Error handling with inline messages
- Loading states during server action

### 5. Gift Detail Page

**[domain]/registry/[giftId]/page.tsx:**
- Direct link to specific gift (shareable)
- Full gift details with image
- Shows claimed status with who claimed
- Inline payment/claiming for available gifts

**GiftDetailClient.tsx:**
- Three-step flow: payment -> confirm -> success
- Success state with auto-refresh after 2 seconds
- Same claiming logic as modal

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] Public registry page renders at /[domain]/registry
- [x] Available gifts show with "Select" option
- [x] Claimed gifts show as claimed with dimmed styling
- [x] Selecting gift shows payment QR code
- [x] Bank transfer generates EPC QR (EUR) or text (CHF)
- [x] PayPal generates PayPal.me link QR with clickable link
- [x] Twint shows instructions text (no QR)
- [x] Gift claiming works atomically (race condition prevented)
- [x] External registry links display and work

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| src/lib/registry/payment-utils.ts | 73 | QR data generation for payment methods |
| src/components/registry/PaymentQRCode.tsx | 99 | QR code rendering with method handling |
| src/components/registry/PublicGiftList.tsx | 162 | Guest-facing gift grid with modal |
| src/components/registry/PaymentModal.tsx | 183 | Two-step payment/claim modal |
| src/app/[domain]/registry/page.tsx | 149 | Public registry server page |
| src/app/[domain]/registry/actions.ts | 37 | Gift claiming server action |
| src/app/[domain]/registry/[giftId]/page.tsx | 162 | Gift detail server page |
| src/app/[domain]/registry/[giftId]/GiftDetailClient.tsx | 155 | Gift detail client component |

## Deviations from Plan

None - plan executed exactly as written.

## Phase 6 Complete

All four plans in Phase 6 (Gift Registry) are now complete:

1. **06-01**: Data models (GiftItem, ExternalRegistry, PaymentSettings)
2. **06-02**: Gift management UI for couples
3. **06-03**: External registries and payment settings configuration
4. **06-04**: Public registry with QR code payments

The gift registry is fully functional:
- Couples can add gifts with amounts and images
- Couples can configure payment method (bank/PayPal/Twint)
- Couples can link to external registries (Amazon, etc.)
- Guests can browse gifts and see payment QR codes
- Guests can claim gifts with atomic race-condition-safe updates
