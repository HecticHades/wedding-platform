# Roadmap

**Project:** Wedding Website Platform
**Created:** 2026-01-16
**Phases:** 10

## Overview

This roadmap derives from the 42 v1 requirements, organized into 10 phases that respect natural dependencies. Foundation and authentication come first because multi-tenant isolation cannot be retrofitted. Content builder and guest/event management enable RSVP. Differentiating features (registry, photos, messaging, seating) build on that core. Custom domains complete the platform as a premium feature.

The comprehensive depth allows each feature area its own phase, making success criteria observable and testable at each boundary.

## Phases

### Phase 1: Foundation

**Goal:** Multi-tenant infrastructure is operational with tenant isolation and scalability patterns in place.
**Depends on:** Nothing (first phase)
**Requirements:** TECH-01, TECH-02, TECH-03, TECH-04, TECH-06
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Project setup, Prisma schema, subdomain routing middleware
- [x] 01-02-PLAN.md — Tenant context with AsyncLocalStorage, Prisma client extension
- [x] 01-03-PLAN.md — Responsive layout components, k6 load testing, verification

**Success Criteria:**
1. Application serves requests from multiple subdomains (e.g., `alice.platform.com`, `bob.platform.com`) routing to correct tenant context
2. Database queries are automatically scoped to tenant - no query can return another tenant's data
3. Static assets load via CDN with cache headers
4. Load test demonstrates handling 100 concurrent users without degradation
5. Mobile viewport renders correctly on phone, tablet, and desktop

---

### Phase 2: Admin & Couple Authentication

**Goal:** Admins can manage the platform, couples can securely access their wedding sites.
**Depends on:** Phase 1
**Requirements:** ADMIN-01, ADMIN-02, ADMIN-04, COUPLE-01
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Auth.js v5 setup with Prisma adapter, credentials provider, JWT strategy
- [x] 02-02-PLAN.md — Admin authentication and dashboard (platform-level management)
- [x] 02-03-PLAN.md — Couple authentication integrated with tenant context

**Success Criteria:**
1. Admin can log in and see a list of all wedding sites on the platform
2. Admin can create a new wedding site and assign it to a couple account
3. Admin can view and edit any couple's site content and settings
4. Couple can log in and access only their own wedding site dashboard
5. Couple cannot see or access any other couple's data

**Note:** ADMIN-03 (view RSVP data across all weddings) deferred to Phase 5 when RSVP infrastructure exists.

---

### Phase 3: Content Builder

**Goal:** Couples can customize their wedding website appearance and content sections.
**Depends on:** Phase 2
**Requirements:** COUPLE-02, COUPLE-03, COUPLE-04, CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06
**Plans:** 6 plans

Plans:
- [x] 03-01-PLAN.md — Schema updates, TypeScript types, Tailwind CSS variable theming, packages
- [x] 03-02-PLAN.md — Template system (3 templates, selection UI, apply to wedding)
- [x] 03-03-PLAN.md — Theme customization (color pickers, font selectors, live preview)
- [x] 03-04-PLAN.md — Content section management (add, remove, reorder with drag-and-drop)
- [x] 03-05-PLAN.md — Section editors for all 6 types (Event Details, Our Story, Travel, Gallery, Timeline, Contact)
- [x] 03-06-PLAN.md — Public site rendering (apply theme, display sections to guests)

**Success Criteria:**
1. Couple can select from at least 3 template designs and preview each before applying
2. Couple can customize colors and fonts, seeing changes reflected in real-time preview
3. Couple can add, edit, reorder, and remove content sections (Event Details, Our Story, Travel, Gallery, Timeline, Contact)
4. Each content section saves correctly and displays on the public wedding site
5. Guest visiting the wedding site URL sees the couple's customized design and content

---

### Phase 4: Event & Guest Management

**Goal:** Couples can define multiple events and manage their guest list infrastructure.
**Depends on:** Phase 3
**Requirements:** EVENT-01, EVENT-02, EVENT-03, EVENT-04
**Plans:** 4 plans

Plans:
- [x] 04-01-PLAN.md — Schema updates (Guest, Event, EventGuest join table), migrations, Prisma client extension
- [x] 04-02-PLAN.md — Event CRUD (server actions, event list, event form, event management pages)
- [x] 04-03-PLAN.md — Guest CRUD (server actions, guest list, guest form, guest management pages)
- [x] 04-04-PLAN.md — Event-guest assignment UI, public site event visibility filtering

**Success Criteria:**
1. Couple can create multiple events (rehearsal dinner, ceremony, reception) with distinct dates/times/locations
2. Couple can control which events are visible to guests (some events may be invite-only)
3. Each event maintains its own attendance tracking separate from other events
4. Guest can see only the events they have access to when viewing the wedding site

---

### Phase 5: RSVP System

**Goal:** Guests can RSVP to events with meal preferences, and couples can track responses.
**Depends on:** Phase 4
**Requirements:** COUPLE-05, COUPLE-07, COUPLE-08, RSVP-01, RSVP-02, RSVP-03, RSVP-04, RSVP-05, RSVP-06, RSVP-07, ADMIN-03
**Plans:** 6 plans

Plans:
- [x] 05-01-PLAN.md — Schema update (mealOptions on Event), install RSVP packages (resend, papaparse, react-email)
- [x] 05-02-PLAN.md — Guest RSVP code authentication and name lookup flow
- [x] 05-03-PLAN.md — Guest RSVP submission form (attendance, plus-one, meal, dietary)
- [x] 05-04-PLAN.md — Couple RSVP dashboard, meal options configuration, set RSVP code
- [x] 05-05-PLAN.md — CSV export endpoint and reminder email sending
- [x] 05-06-PLAN.md — Admin cross-wedding RSVP overview

**Success Criteria:**
1. Guest can access the wedding site using the couple's RSVP code
2. Guest can confirm attendance (yes/no) and indicate plus-one attendance for each visible event
3. Guest can select meal preference from couple-defined options and specify dietary restrictions
4. Couple can view RSVP dashboard showing who responded, attendance counts, and meal tallies
5. Couple can export RSVP data as CSV with guest names, responses, meals, and dietary needs
6. Couple can send reminder notification to guests who have not yet responded
7. Admin can view RSVP data across all weddings (ADMIN-03)

---

### Phase 6: Gift Registry

**Goal:** Couples can create a cash/gift registry and guests can contribute via payment QR codes.
**Depends on:** Phase 5
**Requirements:** GIFT-01, GIFT-02, GIFT-03, GIFT-04, GIFT-05, GIFT-06

**Success Criteria:**
1. Couple can create gift items with descriptions and target amounts (e.g., "Honeymoon Fund - $500")
2. Couple can configure their payment method (bank transfer details, PayPal, or Twint)
3. Guest can browse the gift registry and see which items are still available
4. Guest selects a gift and receives a QR code for the configured payment method
5. Couple can see which gifts have been selected (marked as claimed)
6. Couple can add links to external registries (Amazon, etc.) alongside their cash fund

**Plans:** (created by /gsd:plan-phase)

---

### Phase 7: Photo Sharing

**Goal:** Couples can share wedding photos and guests can upload their own photos.
**Depends on:** Phase 5
**Requirements:** PHOTO-01, PHOTO-02, PHOTO-03, PHOTO-04, PHOTO-05

**Success Criteria:**
1. Couple can upload wedding photos that display in a gallery on their site
2. Guest can view the shared photo gallery
3. Guest can upload their own photos from the wedding event
4. QR code is available (for table cards, etc.) that guests scan to access the photo upload page
5. Couple can moderate guest photos - approve or reject before they appear publicly

**Plans:** (created by /gsd:plan-phase)

---

### Phase 8: Guest Messaging

**Goal:** Couples can communicate with guests via email broadcasts and scheduled messages.
**Depends on:** Phase 5
**Requirements:** MSG-01, MSG-02, MSG-03

**Success Criteria:**
1. Couple can compose and send a broadcast email to all guests with email addresses
2. Couple can schedule a message for future delivery (e.g., "Save the date reminder 2 weeks before")
3. Guest receives email notifications when couple sends updates or reminders

**Plans:** (created by /gsd:plan-phase)

---

### Phase 9: Seating Chart

**Goal:** Couples can create a seating arrangement and guests can view their table assignment.
**Depends on:** Phase 5
**Requirements:** SEAT-01, SEAT-02, SEAT-03, SEAT-04

**Success Criteria:**
1. Couple can create tables with names/numbers and seating capacity
2. Couple can assign RSVP'd guests to tables using drag-and-drop interface
3. Couple can export the seating arrangement (printable format for venue)
4. Guest who has RSVP'd can view their table assignment on the wedding site

**Plans:** (created by /gsd:plan-phase)

---

### Phase 10: Custom Domains & Polish

**Goal:** Couples can use their own domain with SSL, completing the platform experience.
**Depends on:** Phases 1-9
**Requirements:** COUPLE-06, TECH-05

**Success Criteria:**
1. Couple can configure a custom domain (e.g., `aliceandbobwedding.com`) in their settings
2. System provides DNS instructions (CNAME record) for the couple to configure
3. Custom domain is verified and SSL certificate is automatically provisioned
4. Guests accessing the custom domain see the couple's wedding site with valid HTTPS

**Plans:** (created by /gsd:plan-phase)

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1 - Foundation | Complete | 2026-01-16 |
| 2 - Admin & Couple Auth | Complete | 2026-01-17 |
| 3 - Content Builder | Complete | 2026-01-17 |
| 4 - Event & Guest Management | Complete | 2026-01-17 |
| 5 - RSVP System | Complete | 2026-01-17 |
| 6 - Gift Registry | Not started | - |
| 7 - Photo Sharing | Not started | - |
| 8 - Guest Messaging | Not started | - |
| 9 - Seating Chart | Not started | - |
| 10 - Custom Domains & Polish | Not started | - |

---

*Roadmap for milestone: v1.0*
