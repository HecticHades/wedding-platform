# Requirements: Wedding Website Platform

**Defined:** 2026-01-16
**Core Value:** Couples can easily share their wedding details with guests and manage RSVPs, gifts, and photos in one place.

## v1 Requirements

### Platform Administration

- [ ] **ADMIN-01**: Admin can create new wedding sites for couples
- [ ] **ADMIN-02**: Admin can edit any couple's site content and settings
- [ ] **ADMIN-03**: Admin can view RSVP data across all weddings
- [ ] **ADMIN-04**: Admin can create and manage couple accounts

### Couple Site Management

- [ ] **COUPLE-01**: Couple can log in to manage their wedding site
- [ ] **COUPLE-02**: Couple can customize visual theme (colors, fonts)
- [ ] **COUPLE-03**: Couple can choose from template designs
- [ ] **COUPLE-04**: Couple can add/edit/remove content sections
- [ ] **COUPLE-05**: Couple can set their wedding RSVP code
- [ ] **COUPLE-06**: Couple can configure custom domain
- [ ] **COUPLE-07**: Couple can view RSVP dashboard with guest responses
- [ ] **COUPLE-08**: Couple can export RSVP data (guest list, meal choices, dietary needs)

### Content Sections

- [ ] **CONTENT-01**: Event details section (date, time, location, dress code)
- [ ] **CONTENT-02**: Our Story section (text about the couple)
- [ ] **CONTENT-03**: Travel & Hotels section (accommodation info, directions)
- [ ] **CONTENT-04**: Photo gallery section (couple's pre-wedding photos)
- [ ] **CONTENT-05**: Day-of timeline section (wedding day schedule)
- [ ] **CONTENT-06**: Contact info section (how guests can reach couple)

### RSVP System

- [ ] **RSVP-01**: Guest can access site using wedding code
- [ ] **RSVP-02**: Guest can confirm attendance (yes/no)
- [ ] **RSVP-03**: Guest can indicate plus-one attendance
- [ ] **RSVP-04**: Guest can select meal preference from options
- [ ] **RSVP-05**: Guest can specify dietary restrictions (free text)
- [ ] **RSVP-06**: Couple can define meal options per event
- [ ] **RSVP-07**: Couple can send reminder to non-responders

### Multi-Event Support

- [ ] **EVENT-01**: Couple can create multiple events (rehearsal, ceremony, reception)
- [ ] **EVENT-02**: Each event has separate RSVP tracking
- [ ] **EVENT-03**: Couple can control which events guests see/RSVP to
- [ ] **EVENT-04**: Guest can RSVP separately for each visible event

### Gift Registry

- [ ] **GIFT-01**: Couple can create predefined gift list with descriptions and amounts
- [ ] **GIFT-02**: Couple can configure payment method (bank transfer, PayPal, Twint)
- [ ] **GIFT-03**: Guest can browse available gifts
- [ ] **GIFT-04**: Guest can select a gift and receive payment QR code
- [ ] **GIFT-05**: Couple can see which gifts have been selected
- [ ] **GIFT-06**: Couple can add links to external registries (Amazon, etc.)

### Photo Sharing

- [ ] **PHOTO-01**: Couple can upload wedding photos after the event
- [ ] **PHOTO-02**: Guest can view shared wedding photos
- [ ] **PHOTO-03**: Guest can upload their own photos from the event
- [ ] **PHOTO-04**: QR code available for guests to access photo upload
- [ ] **PHOTO-05**: Couple can moderate (approve/reject) guest photos before display

### Guest Messaging

- [ ] **MSG-01**: Couple can send broadcast message to all guests via email
- [ ] **MSG-02**: Couple can schedule messages for future delivery
- [ ] **MSG-03**: Guest receives email notifications for updates

### Seating Chart

- [ ] **SEAT-01**: Couple can create tables with capacity
- [ ] **SEAT-02**: Couple can assign guests to tables via drag-drop
- [ ] **SEAT-03**: Couple can export seating arrangement
- [ ] **SEAT-04**: Guest can view their table assignment on site

### Technical Requirements

- [ ] **TECH-01**: Site is mobile responsive (works on phone, tablet, desktop)
- [ ] **TECH-02**: Site loads fast (CDN for static assets)
- [ ] **TECH-03**: Multi-tenant architecture (single deployment serves all couples)
- [ ] **TECH-04**: Tenant data isolation (couples cannot see other couples' data)
- [ ] **TECH-05**: Custom domain SSL certificates
- [ ] **TECH-06**: Handle wedding-day traffic spikes

## v2 Requirements

### Deferred Features

- **MULTI-LANG-01**: Multilingual support (language toggle for international weddings)
- **INVITE-01**: Digital invitations with matching design
- **INVITE-02**: Invitation delivery tracking (opens, clicks)
- **AUDIO-01**: Audio guestbook (voice messages from guests)
- **ANALYTICS-01**: Advanced analytics (page views, engagement)
- **BILLING-01**: Billing system for commercial pricing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video streaming | Bandwidth costs, complexity - couples can link to YouTube/Vimeo |
| In-platform chat | Creates support expectations - use email contact instead |
| Native mobile apps | PWA sufficient, doubles development surface |
| Complex e-commerce registry | Inventory/shipping nightmare - cash funds and external links instead |
| Vendor directory/booking | Different business - leave to specialized platforms |
| AI wedding planner | Gimmick that will disappoint - curated FAQ instead |
| User-generated templates | QA nightmare - professionally designed templates only |
| Print services | Different business - partner or offer print-ready downloads |
| 3D floor plans | Overkill for most couples |
| Full wedding planning suite | Stay focused - website + RSVP + registry + photos |

## Traceability

| Requirement | Phase | Status | Notes |
|-------------|-------|--------|-------|
| TECH-01 | Phase 1 | Complete | |
| TECH-02 | Phase 1 | Complete | |
| TECH-03 | Phase 1 | Complete | |
| TECH-04 | Phase 1 | Complete | |
| TECH-06 | Phase 1 | Complete | |
| ADMIN-01 | Phase 2 | Complete | |
| ADMIN-02 | Phase 2 | Complete | |
| ADMIN-03 | Phase 5 | Pending | Requires RSVP infrastructure from Phase 5; admin role established in Phase 2 |
| ADMIN-04 | Phase 2 | Complete | |
| COUPLE-01 | Phase 2 | Complete | |
| COUPLE-02 | Phase 3 | Complete | |
| COUPLE-03 | Phase 3 | Complete | |
| COUPLE-04 | Phase 3 | Complete | |
| CONTENT-01 | Phase 3 | Complete | |
| CONTENT-02 | Phase 3 | Complete | |
| CONTENT-03 | Phase 3 | Complete | |
| CONTENT-04 | Phase 3 | Complete | |
| CONTENT-05 | Phase 3 | Complete | |
| CONTENT-06 | Phase 3 | Complete | |
| EVENT-01 | Phase 4 | Complete | |
| EVENT-02 | Phase 4 | Complete | |
| EVENT-03 | Phase 4 | Complete | |
| EVENT-04 | Phase 4 | Pending | Requires RSVP system from Phase 5 |
| COUPLE-05 | Phase 5 | Pending | |
| COUPLE-07 | Phase 5 | Pending | |
| COUPLE-08 | Phase 5 | Pending | |
| RSVP-01 | Phase 5 | Pending | |
| RSVP-02 | Phase 5 | Pending | |
| RSVP-03 | Phase 5 | Pending | |
| RSVP-04 | Phase 5 | Pending | |
| RSVP-05 | Phase 5 | Pending | |
| RSVP-06 | Phase 5 | Pending | |
| RSVP-07 | Phase 5 | Pending | |
| GIFT-01 | Phase 6 | Pending | |
| GIFT-02 | Phase 6 | Pending | |
| GIFT-03 | Phase 6 | Pending | |
| GIFT-04 | Phase 6 | Pending | |
| GIFT-05 | Phase 6 | Pending | |
| GIFT-06 | Phase 6 | Pending | |
| PHOTO-01 | Phase 7 | Pending | |
| PHOTO-02 | Phase 7 | Pending | |
| PHOTO-03 | Phase 7 | Pending | |
| PHOTO-04 | Phase 7 | Pending | |
| PHOTO-05 | Phase 7 | Pending | |
| MSG-01 | Phase 8 | Pending | |
| MSG-02 | Phase 8 | Pending | |
| MSG-03 | Phase 8 | Pending | |
| SEAT-01 | Phase 9 | Pending | |
| SEAT-02 | Phase 9 | Pending | |
| SEAT-03 | Phase 9 | Pending | |
| SEAT-04 | Phase 9 | Pending | |
| COUPLE-06 | Phase 10 | Pending | |
| TECH-05 | Phase 10 | Pending | |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-01-16*
*Last updated: 2026-01-17 - Phase 4 requirements marked Complete (EVENT-04 pending Phase 5 RSVP)*
