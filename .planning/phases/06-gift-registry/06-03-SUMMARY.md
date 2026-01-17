---
phase: 06-gift-registry
plan: 03
subsystem: dashboard
tags: [external-registry, payment-settings, navigation, couple-dashboard]
requires:
  - 06-01 (Data models for GiftItem, ExternalRegistry, PaymentSettings)
provides:
  - External registry CRUD (add/edit/delete links to Amazon, Target, etc.)
  - Payment settings configuration (bank transfer, PayPal, Twint)
  - Unified registry navigation tabs
affects:
  - 06-04 (Payment QR codes will use configured payment settings)
tech-stack:
  added: []
  patterns:
    - Conditional form fields based on selection
    - Tab navigation component for section switching
    - IBAN validation with Zod transform
key-files:
  created:
    - src/app/(platform)/dashboard/registry/external/actions.ts
    - src/app/(platform)/dashboard/registry/external/page.tsx
    - src/app/(platform)/dashboard/registry/external/ExternalRegistryList.tsx
    - src/app/(platform)/dashboard/registry/settings/actions.ts
    - src/app/(platform)/dashboard/registry/settings/page.tsx
    - src/components/registry/ExternalRegistryCard.tsx
    - src/components/registry/ExternalRegistryForm.tsx
    - src/components/registry/PaymentSettingsForm.tsx
    - src/components/registry/RegistryTabs.tsx
  modified:
    - src/app/(platform)/dashboard/registry/page.tsx
decisions:
  - decision: "IBAN validation with Zod transform for normalization"
    rationale: "Removes spaces and uppercases before validation, user-friendly input"
  - decision: "Conditional form fields based on payment method selection"
    rationale: "Only show relevant fields for selected method, reduces cognitive load"
  - decision: "Unified Gift Registry title with tabs for sub-navigation"
    rationale: "Consistent UX across gifts/external/settings pages"
metrics:
  duration: 8 min
  completed: 2026-01-17
---

# Phase 6 Plan 3: External Registries & Payment Settings Summary

External registry management and payment settings configuration for the couple dashboard, with unified navigation across registry pages.

## One-liner

External registry CRUD with form validation, payment settings for bank/PayPal/Twint with IBAN validation, and tab navigation across registry pages.

## Commits

| Hash | Message |
|------|---------|
| 733d388 | feat(06-03): implement external registry CRUD |
| f945a3d | feat(06-03): implement payment settings configuration |
| 3ede08e | feat(06-03): add navigation between registry pages |

## What Was Built

### 1. External Registry Management

**Server Actions (external/actions.ts):**
- `createExternalRegistry(formData)` - Create new registry link with name, URL, description
- `updateExternalRegistry(id, formData)` - Update existing registry
- `deleteExternalRegistry(id)` - Delete registry link
- `reorderExternalRegistries(ordered)` - Reorder registries

**Components:**
- `ExternalRegistryCard` - Displays registry with edit/delete and link preview
- `ExternalRegistryForm` - Client form for add/edit with URL validation
- `ExternalRegistryList` - List management with add form and suggestions

**Page (external/page.tsx):**
- Lists all external registries with popular suggestions
- Quick add buttons for Amazon, Target, Williams Sonoma, etc.
- Empty state when no registries configured

### 2. Payment Settings Configuration

**Server Action (settings/actions.ts):**
- `updatePaymentSettings(formData)` - Updates Wedding.paymentSettings JSON
- IBAN validation: removes spaces, uppercases, validates format
- BIC validation: optional, max 11 chars
- Method-specific field handling for bank/PayPal/Twint

**Component (PaymentSettingsForm.tsx):**
- Enable/disable toggle for cash gifts
- Radio selection for payment method
- Conditional fields based on method:
  - Bank transfer: account name, IBAN, BIC (optional), currency (EUR/CHF)
  - PayPal: username (paypal.me prefix), currency (optional)
  - Twint: display text, phone number (optional)
- Security notice about data storage

**Page (settings/page.tsx):**
- Payment method info callout
- Form with current settings pre-populated

### 3. Registry Navigation

**Component (RegistryTabs.tsx):**
- Three tabs: Gifts, External Registries, Payment Settings
- Active tab highlighting with border indicator
- Icons for each tab (Gift, ExternalLink, Settings)

**Main Page Updates (page.tsx):**
- Added RegistryTabs to all registry pages
- Payment status indicator (enabled via X or "Set up payment method")
- External registry count with link

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] External registries page renders at /dashboard/registry/external
- [x] External registry CRUD operations work
- [x] Payment settings page renders at /dashboard/registry/settings
- [x] Payment method selection shows correct conditional fields
- [x] IBAN validation catches invalid formats
- [x] Settings persist to database via Wedding.paymentSettings
- [x] Navigation between registry pages works via tabs

## Files Created/Modified

| File | Lines | Purpose |
|------|-------|---------|
| external/actions.ts | 231 | External registry CRUD server actions |
| external/page.tsx | 54 | External registries list page |
| external/ExternalRegistryList.tsx | 143 | List management with add/edit |
| settings/actions.ts | 164 | Payment settings update action |
| settings/page.tsx | 75 | Payment settings page |
| ExternalRegistryCard.tsx | 116 | Registry card with actions |
| ExternalRegistryForm.tsx | 113 | Add/edit form for registries |
| PaymentSettingsForm.tsx | 361 | Payment settings form with method toggle |
| RegistryTabs.tsx | 55 | Tab navigation component |
| registry/page.tsx | +63 | Added tabs and status indicators |

## Deviations from Plan

None - plan executed exactly as written.

Note: The main registry page and gift actions already existed from a previous 06-02 session, so Task 3 updated the existing page rather than creating it from scratch.

## Next Phase Readiness

Ready for 06-04 (Payment QR Codes):
- PaymentSettings stored in Wedding.paymentSettings
- Bank transfer details available for EPC QR generation
- PayPal username ready for PayPal.me link
- Twint settings stored for display instructions
