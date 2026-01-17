# Phase 6: Gift Registry - Research

**Researched:** 2026-01-17
**Domain:** Gift registry with QR code payment integration (Bank Transfer, PayPal, Twint)
**Confidence:** HIGH

## Summary

This phase implements a wedding gift registry system where couples can create cash fund items and guests can contribute via payment QR codes. The key challenge is generating appropriate QR codes for three different payment methods: bank transfers (using EPC/Swiss QR bill standards), PayPal (using PayPal.me links), and Twint (Swiss-specific payment app).

The architecture follows the existing content section pattern used for travel, gallery, and other sections. Gift registry data will be stored as a new content section type with payment configuration stored separately at the wedding level (to avoid exposing sensitive payment details in public JSON).

**Primary recommendation:** Use `qrcode.react` for QR code rendering with `sepa-payment-qr-code` for EPC bank transfer QR data generation. Store payment configuration in a separate `PaymentSettings` model for security, and gift items in the existing content sections pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| qrcode.react | 4.2.x | QR code rendering as SVG/Canvas | 1,150+ npm dependents, flexible, React-native |
| sepa-payment-qr-code | 2.0.x | Generate EPC QR code data for SEPA transfers | Follows European Payments Council guidelines |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| swissqrbill | 4.2.x | Swiss QR bill generation | Only if full Swiss QR bill PDF needed (likely not for this phase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode.react | next-qrcode | next-qrcode is Next.js specific but smaller community |
| qrcode.react | react-qr-code | react-qr-code works but fewer features |
| sepa-payment-qr-code | @bbitgmbh/bbit.swiss-qr-bill | Full Swiss QR bill is overkill for simple bank transfer QR |

**Installation:**
```bash
npm install qrcode.react sepa-payment-qr-code
```

## Architecture Patterns

### Database Schema Extension

Add payment settings to Wedding model (separate from content for security):

```prisma
model Wedding {
  // ... existing fields ...

  // Payment settings (stored separately from public contentSections)
  /// [PaymentSettings]
  paymentSettings Json @default("{}")
}

model GiftItem {
  id          String   @id @default(cuid())
  weddingId   String
  wedding     Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  name        String
  description String?
  targetAmount Decimal  @db.Decimal(10, 2)
  imageUrl    String?
  order       Int      @default(0)

  // Tracking
  isClaimed   Boolean  @default(false)
  claimedBy   String?  // Guest name (optional, for display)
  claimedAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([weddingId])
  @@index([weddingId, isClaimed])
}

model ExternalRegistry {
  id          String   @id @default(cuid())
  weddingId   String
  wedding     Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)

  name        String   // e.g., "Amazon", "Williams Sonoma"
  url         String
  description String?
  order       Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([weddingId])
}
```

### Payment Settings Type

```typescript
// Add to prisma-json.d.ts
interface PaymentSettings {
  enabled: boolean;
  method: 'bank_transfer' | 'paypal' | 'twint' | null;

  // Bank transfer (EPC QR code)
  bankTransfer?: {
    accountName: string;      // Recipient name
    iban: string;             // Bank account number
    bic?: string;             // Optional BIC/SWIFT
    currency: 'EUR' | 'CHF';  // EPC only supports EUR, Swiss QR supports CHF
  };

  // PayPal
  paypal?: {
    username: string;         // PayPal.me username
    currency?: string;        // Optional currency code
  };

  // Twint (Swiss-specific)
  twint?: {
    // Twint requires business integration OR simple display of instructions
    // For personal use, display phone number or Twint ID
    displayText: string;      // Instructions for guest
    phoneNumber?: string;     // If applicable
  };
}
```

### Recommended Project Structure

```
src/
├── components/
│   ├── registry/
│   │   ├── GiftCard.tsx           # Individual gift display
│   │   ├── GiftList.tsx           # Gift grid/list for guests
│   │   ├── GiftForm.tsx           # Add/edit gift (couple dashboard)
│   │   ├── PaymentQRCode.tsx      # QR code generation component
│   │   ├── PaymentModal.tsx       # Modal showing QR code for payment
│   │   ├── ExternalRegistryCard.tsx  # External registry link card
│   │   └── ExternalRegistryForm.tsx  # Add/edit external registry
│   └── content/
│       └── sections/
│           └── GiftRegistrySection.tsx  # Public-facing registry section
├── lib/
│   └── registry/
│       ├── payment-utils.ts       # QR code data generation
│       └── registry-utils.ts      # Gift filtering, stats
└── app/
    ├── (platform)/
    │   └── dashboard/
    │       └── registry/
    │           ├── page.tsx       # Registry management
    │           ├── actions.ts     # Server actions
    │           ├── new/
    │           │   └── page.tsx   # Add gift item
    │           ├── [id]/
    │           │   └── page.tsx   # Edit gift item
    │           ├── external/
    │           │   └── page.tsx   # Manage external registries
    │           └── settings/
    │               └── page.tsx   # Payment settings
    └── [domain]/
        └── registry/
            ├── page.tsx           # Public registry view
            └── [giftId]/
                └── page.tsx       # Gift detail with QR code
```

### Pattern 1: QR Code Generation by Payment Type

**What:** Generate appropriate QR code data based on payment method
**When to use:** When guest selects a gift to contribute
**Example:**

```typescript
// src/lib/registry/payment-utils.ts
import generateSepaQrCode from 'sepa-payment-qr-code';

export function generateQRCodeData(
  paymentSettings: PrismaJson.PaymentSettings,
  amount: number,
  reference: string
): string | null {
  if (!paymentSettings.enabled || !paymentSettings.method) {
    return null;
  }

  switch (paymentSettings.method) {
    case 'bank_transfer':
      if (!paymentSettings.bankTransfer) return null;
      // EPC QR code for SEPA transfers (EUR only)
      if (paymentSettings.bankTransfer.currency === 'EUR') {
        return generateSepaQrCode({
          name: paymentSettings.bankTransfer.accountName,
          iban: paymentSettings.bankTransfer.iban.replace(/\s/g, ''),
          amount: amount,
          unstructuredReference: reference,
        });
      }
      // For CHF, format as simple text (or use Swiss QR bill format)
      return formatSwissBankTransfer(paymentSettings.bankTransfer, amount, reference);

    case 'paypal':
      if (!paymentSettings.paypal) return null;
      // PayPal.me link with amount
      const currency = paymentSettings.paypal.currency || 'USD';
      return `https://paypal.me/${paymentSettings.paypal.username}/${amount}${currency}`;

    case 'twint':
      // Twint doesn't support simple QR generation for personal use
      // Return null and show instructions instead
      return null;

    default:
      return null;
  }
}

function formatSwissBankTransfer(
  config: NonNullable<PrismaJson.PaymentSettings['bankTransfer']>,
  amount: number,
  reference: string
): string {
  // Simple text format for Swiss bank transfer (not EPC compliant)
  return `Bank Transfer to ${config.accountName}\nIBAN: ${config.iban}\nAmount: ${amount} CHF\nReference: ${reference}`;
}
```

### Pattern 2: PaymentQRCode Component

**What:** React component that renders the appropriate QR code
**When to use:** In payment modal or gift detail page

```typescript
// src/components/registry/PaymentQRCode.tsx
"use client";

import { QRCodeSVG } from 'qrcode.react';
import { generateQRCodeData } from '@/lib/registry/payment-utils';

interface PaymentQRCodeProps {
  paymentSettings: PrismaJson.PaymentSettings;
  amount: number;
  giftName: string;
  giftId: string;
}

export function PaymentQRCode({
  paymentSettings,
  amount,
  giftName,
  giftId,
}: PaymentQRCodeProps) {
  const reference = `Gift: ${giftName}`;
  const qrData = generateQRCodeData(paymentSettings, amount, reference);

  // Twint doesn't support QR - show instructions
  if (paymentSettings.method === 'twint') {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Pay with Twint</h3>
        <p className="text-gray-600 mb-4">
          {paymentSettings.twint?.displayText || 'Open Twint and send payment'}
        </p>
        {paymentSettings.twint?.phoneNumber && (
          <p className="font-mono text-xl">{paymentSettings.twint.phoneNumber}</p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Amount: {amount} CHF | Reference: {reference}
        </p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Payment not configured</p>
      </div>
    );
  }

  // For PayPal, show clickable link alongside QR
  const isPayPal = paymentSettings.method === 'paypal';

  return (
    <div className="text-center">
      <QRCodeSVG
        value={qrData}
        size={256}
        level="M"
        includeMargin
        className="mx-auto"
      />
      <p className="mt-4 text-sm text-gray-600">
        Scan with your {isPayPal ? 'phone camera or PayPal app' : 'banking app'}
      </p>
      {isPayPal && (
        <a
          href={qrData}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          Or click here to pay with PayPal
        </a>
      )}
    </div>
  );
}
```

### Pattern 3: Gift Claiming Flow

**What:** Track when guests select/claim a gift
**When to use:** To prevent duplicate gifts and show progress

```typescript
// Server action for claiming a gift
export async function claimGift(giftId: string, guestName?: string) {
  // No authentication required - guests can claim anonymously
  // But we track the claim to prevent duplicates

  const gift = await prisma.giftItem.findUnique({
    where: { id: giftId },
    select: { id: true, isClaimed: true, weddingId: true },
  });

  if (!gift) {
    return { success: false, error: 'Gift not found' };
  }

  if (gift.isClaimed) {
    return { success: false, error: 'This gift has already been claimed' };
  }

  await prisma.giftItem.update({
    where: { id: giftId },
    data: {
      isClaimed: true,
      claimedBy: guestName || 'Anonymous',
      claimedAt: new Date(),
    },
  });

  revalidatePath('/[domain]/registry');
  return { success: true };
}
```

### Anti-Patterns to Avoid

- **Storing payment details in public content sections:** Payment settings (IBAN, PayPal username) should be in a separate secured field, not in `contentSections` JSON that's publicly exposed
- **Actual payment processing:** Don't build a payment gateway - generate QR codes that link to external payment methods
- **Automatic payment verification:** There's no way to automatically verify bank transfers or Twint - rely on manual "mark as received" by couple
- **Storing full bank account numbers client-side:** Only expose QR code data, not raw credentials

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Custom pixel-by-pixel QR | qrcode.react | Complex algorithm, error correction levels |
| EPC QR code format | Custom string formatting | sepa-payment-qr-code | EPC spec is complex, needs validation |
| IBAN validation | Regex matching | Built-in Zod or validator.js | Country-specific formats, check digits |
| PayPal.me link format | Hardcoded string | Simple template pattern | Format: `paypal.me/username/amount[currency]` |

**Key insight:** QR code generation is well-solved. The complexity is in generating the correct DATA to encode, not the QR rendering itself.

## Common Pitfalls

### Pitfall 1: EPC QR Code Currency Limitation
**What goes wrong:** Trying to use EPC QR codes for non-EUR currencies
**Why it happens:** EPC (European Payments Council) only supports EUR
**How to avoid:** For CHF, use Swiss QR bill format or simple text display
**Warning signs:** QR code doesn't scan in Swiss banking apps

### Pitfall 2: Twint Integration Complexity
**What goes wrong:** Assuming Twint works like PayPal with simple links
**Why it happens:** Twint requires business integration for QR payments
**How to avoid:** For personal wedding use, display payment instructions instead of QR
**Warning signs:** Looking for "Twint API" or "Twint developer docs" for personal use

### Pitfall 3: Exposing Payment Credentials
**What goes wrong:** Including IBAN/PayPal username in publicly-fetched JSON
**Why it happens:** Following existing contentSections pattern blindly
**How to avoid:** Separate PaymentSettings field with server-side only access
**Warning signs:** Payment details visible in browser network tab

### Pitfall 4: Race Condition in Gift Claiming
**What goes wrong:** Two guests claim same gift simultaneously
**Why it happens:** Check-then-update without transaction
**How to avoid:** Use Prisma transaction with conditional update
**Warning signs:** Multiple "claimed" notifications for same gift

```typescript
// Correct: Atomic update with condition
const result = await prisma.giftItem.updateMany({
  where: {
    id: giftId,
    isClaimed: false, // Only update if not already claimed
  },
  data: {
    isClaimed: true,
    claimedBy: guestName,
    claimedAt: new Date(),
  },
});

if (result.count === 0) {
  return { success: false, error: 'Gift already claimed' };
}
```

### Pitfall 5: Mobile QR Scanning UX
**What goes wrong:** QR codes too small or low contrast on mobile
**Why it happens:** Using default sizes without testing
**How to avoid:** Minimum 256px size, high contrast (black on white), error level M or higher
**Warning signs:** QR code won't scan on certain phones

## Code Examples

Verified patterns from official sources:

### qrcode.react Basic Usage
```typescript
// Source: https://github.com/zpao/qrcode.react
import { QRCodeSVG } from 'qrcode.react';

// Basic usage
<QRCodeSVG value="https://example.com" />

// With customization
<QRCodeSVG
  value="payment data here"
  size={256}
  level="M"              // Error correction: L, M, Q, H
  bgColor="#FFFFFF"
  fgColor="#000000"
  includeMargin={true}
/>
```

### sepa-payment-qr-code Usage
```typescript
// Source: https://github.com/derhuerst/sepa-payment-qr-code
import generateQrCode from 'sepa-payment-qr-code';

const qrData = generateQrCode({
  name: 'Jane & John Smith',           // Recipient name
  iban: 'DE89370400440532013000',       // IBAN (spaces stripped)
  amount: 150.00,                        // Amount in EUR
  unstructuredReference: 'Wedding Gift: Honeymoon Fund',
});

// qrData is a string to be encoded in QR code
// Use with qrcode.react: <QRCodeSVG value={qrData} />
```

### PayPal.me Link Format
```typescript
// Source: https://www.paypal.com/us/cshelp/article/paypalme-frequently-asked-questions-help432
function generatePayPalMeLink(username: string, amount: number, currency = 'USD'): string {
  // Format: paypal.me/username/amountCURRENCY
  return `https://paypal.me/${username}/${amount}${currency}`;
}

// Examples:
// paypal.me/JohnSmith/100      -> $100 USD (default currency)
// paypal.me/JohnSmith/50EUR    -> 50 EUR
// paypal.me/JohnSmith/75CHF    -> 75 CHF
```

### Zod Schema for Payment Settings
```typescript
// Validation schema for payment configuration
import { z } from 'zod';

const ibanSchema = z.string()
  .min(15)
  .max(34)
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, 'Invalid IBAN format')
  .transform(val => val.replace(/\s/g, '').toUpperCase());

const paymentSettingsSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(['bank_transfer', 'paypal', 'twint']).nullable(),

  bankTransfer: z.object({
    accountName: z.string().min(1).max(70), // EPC limit
    iban: ibanSchema,
    bic: z.string().optional(),
    currency: z.enum(['EUR', 'CHF']),
  }).optional(),

  paypal: z.object({
    username: z.string().min(1).max(50),
    currency: z.string().length(3).optional(),
  }).optional(),

  twint: z.object({
    displayText: z.string().min(1),
    phoneNumber: z.string().optional(),
  }).optional(),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payment slips with bank details | QR codes for instant transfer initiation | 2020-2022 (Europe) | Guests scan and pay from phone |
| Manual PayPal email requests | PayPal.me links with prefilled amounts | 2015+ | One-click payment flow |
| Swiss orange payment slips | Swiss QR bills | Oct 2022 (mandatory) | All Swiss payments use QR codes |

**Deprecated/outdated:**
- Orange payment slips (Switzerland): Fully replaced by Swiss QR bills as of Oct 2022
- Manual IBAN entry: Most European banking apps now expect QR codes

## Open Questions

Things that couldn't be fully resolved:

1. **Twint Personal Use Integration**
   - What we know: Twint requires business contracts for QR code payment acceptance
   - What's unclear: Whether there's a personal "request money" feature with QR
   - Recommendation: Display payment instructions with phone number, don't promise QR

2. **Swiss QR Bill vs Simple Bank Transfer**
   - What we know: Swiss QR bill is the official format for CHF payments
   - What's unclear: Whether a simpler format works for peer-to-peer gifts
   - Recommendation: Start with simple IBAN display, add full Swiss QR bill if requested

3. **Partial Contributions**
   - What we know: Requirements mention "target amounts"
   - What's unclear: Whether guests can contribute partial amounts
   - Recommendation: Support partial contributions, track separately from "claimed"

## Sources

### Primary (HIGH confidence)
- qrcode.react npm/GitHub - Installation, props, rendering options
- sepa-payment-qr-code npm/GitHub - EPC QR code generation, API
- PayPal.me FAQ - Link format with prefilled amounts
- EPC QR Code Wikipedia/European Payments Council - Standard specification

### Secondary (MEDIUM confidence)
- WebSearch: Swiss QR bill integration patterns (verified against swissqrbill docs)
- WebSearch: Wedding registry UX patterns (verified against Zola, Joy documentation)
- WebSearch: Twint business integration (verified against twint.ch official)

### Tertiary (LOW confidence)
- WebSearch: Best practices for wedding cash funds (community patterns, not official)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-established npm packages with clear documentation
- Architecture: HIGH - Follows existing project patterns exactly
- Payment methods: MEDIUM - EPC/PayPal clear, Twint has limitations for personal use
- Pitfalls: HIGH - Based on technical constraints of libraries

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable domain)
