---
phase: 03-content-builder
plan: 01
subsystem: content-builder-foundation
tags: [prisma, typescript, tailwind, theming, dnd-kit, vercel-blob]
dependency-graph:
  requires: [02-admin-couple-auth]
  provides: [typed-json-fields, css-variable-theming, content-section-types]
  affects: [03-02, 03-03, 03-04]
tech-stack:
  added: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "@vercel/blob", "react-colorful", "prisma-json-types-generator"]
  patterns: [css-variables-theming, typed-json-prisma, zod-validation]
key-files:
  created:
    - src/types/prisma-json.d.ts
    - src/lib/content/section-types.ts
    - src/lib/content/theme-utils.ts
  modified:
    - prisma/schema.prisma
    - tailwind.config.ts
    - package.json
decisions:
  - id: prisma-json-version
    choice: "prisma-json-types-generator@3.2.3"
    reason: "Latest version (4.x) requires Prisma 7.2+; v3.2.3 compatible with Prisma 6.x"
metrics:
  duration: 8 min
  completed: 2026-01-17
---

# Phase 3 Plan 1: Content Builder Foundation Summary

**One-liner:** Prisma schema with typed JSON fields (ThemeSettings, ContentSection[]) + Tailwind CSS variable theming + Zod validation schemas for 6 content section types.

## What Was Built

### Prisma Schema Updates

Added three new fields to the Wedding model:
- `templateId` (String, default "classic") - Selected template identifier
- `themeSettings` (Json, typed as ThemeSettings) - Color and font customization
- `contentSections` (Json, typed as ContentSection[]) - Ordered array of content sections

Configured `prisma-json-types-generator` to provide compile-time type safety for JSON fields via special comments (`/// [ThemeSettings]`, `/// [ContentSection[]]`).

### TypeScript Type System

**src/types/prisma-json.d.ts:**
- `ThemeSettings` interface: primaryColor, secondaryColor, backgroundColor, textColor, accentColor, fontFamily, headingFont
- `SectionType` union: "event-details" | "our-story" | "travel" | "gallery" | "timeline" | "contact"
- `ContentSection` interface: id, type, order, isVisible, content
- Individual content interfaces for each section type with full type definitions

**src/lib/content/section-types.ts:**
- `SECTION_TYPES` constant with id, label, icon, description for each type
- Zod validation schemas for all content types using discriminated unions
- Helper functions: `createEmptySection()`, `getSectionLabel()`, `getSectionMetadata()`

**src/lib/content/theme-utils.ts:**
- `DEFAULT_THEME` constant with elegant wedding colors
- `generateCSSVariables()` for string output
- `generateCSSVariablesObject()` for React style props
- `FONT_OPTIONS` array with 20 Google Fonts organized by category
- `COLOR_PALETTES` with 6 preset color combinations
- Utility functions: contrast checking, hex-to-rgb conversion, validation

### Tailwind Configuration

Extended theme with CSS variable-based wedding colors and fonts:
- Colors: `wedding-primary`, `wedding-secondary`, `wedding-background`, `wedding-text`, `wedding-accent`
- Fonts: `font-wedding`, `font-wedding-heading`

This enables runtime theme switching by setting CSS variables at a parent element level.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| prisma-json-types-generator version | 3.2.3 | Latest 4.x requires Prisma 7.2+; 3.2.3 works with our Prisma 6.x |
| Discriminated union for content | Zod discriminatedUnion on "type" | Better error messages, TypeScript inference |
| CSS variables over Tailwind themes | CSS custom properties | Runtime switching without rebuild |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 439d15f | chore | Install content builder packages and update Prisma schema |
| 132df99 | feat | Add TypeScript types for content sections and themes |
| 6652884 | feat | Configure Tailwind for CSS variable theming |

## Deviations from Plan

### Version Adjustment

**[Rule 3 - Blocking] prisma-json-types-generator version conflict**

- **Found during:** Task 1 package installation
- **Issue:** Latest version (4.1.0) requires @prisma/client ^7.2.0, but project uses Prisma 6.x
- **Fix:** Installed compatible version 3.2.3 which supports Prisma 5/6
- **Impact:** No functional difference; will need to upgrade when moving to Prisma 7

## Verification Results

| Check | Status |
|-------|--------|
| `npm ls @dnd-kit/core @vercel/blob react-colorful` | Installed |
| `npx prisma validate` | Passed |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed |
| Wedding model has templateId, themeSettings, contentSections | Verified |

## Files Created/Modified

**Created:**
- `src/types/prisma-json.d.ts` - PrismaJson namespace with all type definitions
- `src/lib/content/section-types.ts` - Constants, Zod schemas, helper functions
- `src/lib/content/theme-utils.ts` - CSS variable generation, font/palette constants

**Modified:**
- `prisma/schema.prisma` - Added jsonTypes generator and Wedding fields
- `tailwind.config.ts` - Added wedding colors and fonts
- `package.json` - Added 6 new dependencies

## Next Phase Readiness

Ready for Plan 03-02 (Templates):
- Theme types available for template definitions
- Content section types ready for default section generation
- CSS variable system in place for template previews

Dependencies available:
- `@dnd-kit/*` ready for section reordering
- `@vercel/blob` ready for image uploads
- `react-colorful` ready for color picker UI
