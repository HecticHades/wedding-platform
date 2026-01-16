# Features Research: Wedding Website Platform

**Domain:** Multi-tenant Wedding Website SaaS
**Researched:** 2026-01-16
**Confidence:** HIGH (based on analysis of 15+ competitor platforms and industry sources)

## Table Stakes

Features users expect as baseline. Missing these = users leave for competitors.

| Feature | Description | Complexity | Dependencies | Notes |
|---------|-------------|------------|--------------|-------|
| **Customizable Website Builder** | Template-based website creation with color, font, image customization | High | None | 79% of couples use wedding websites as primary guest communication (The Knot). Need 50+ templates minimum to compete. |
| **RSVP System** | Online RSVP collection with guest responses, meal selections, dietary restrictions | Medium | Guest List | Most critical planning tool. Must support plus-ones, group RSVPs (families), multiple events. |
| **Guest List Management** | Import, organize, and track guests with tags, groups, and RSVP status | Medium | None | Foundation for RSVP, seating, and communications. Must support CSV import. |
| **Event Details Pages** | Ceremony and reception info: date, time, location, dress code, parking | Low | None | Core informational purpose. Include Google Maps integration. |
| **Mobile Responsive Design** | Works on all devices - phone, tablet, desktop | Medium | None | Most guests access from phones. WCAG 2.1 SC 1.4.10 requires content reflow at 320px width. |
| **Password Protection** | Privacy settings to keep site from public search engines | Low | None | Essential for privacy. Prevents wedding crashers finding details via Google. |
| **Travel & Accommodation Info** | Hotel blocks, local recommendations, transportation details | Low | None | Critical for destination/out-of-town guests. |
| **Registry Integration** | Link to external registries or built-in registry page | Low-Medium | None | Can start with external links; full integration is differentiator. |
| **Countdown Timer** | Days until wedding display | Low | None | Builds anticipation. Simple but expected. |
| **Custom Subdomain** | yourname.ourplatform.com | Low | None | Free tier baseline. Custom domains are differentiator. |
| **Basic Photo Gallery** | Upload and display engagement/couple photos | Low | None | 5-20 photos sufficient for basic. Guest uploads are differentiator. |
| **Contact Form/Info** | Way for guests to reach couple with questions | Low | None | Reduces back-and-forth communication. |

## Differentiators

Features that set the platform apart from competitors. Build these to win market share.

### High-Value Differentiators

| Feature | Description | Complexity | Dependencies | Competitive Advantage |
|---------|-------------|------------|--------------|----------------------|
| **RSVP Codes/Unique Links** | Individual codes or links per guest for secure, personalized RSVP | Medium | Guest List | Prevents unauthorized RSVPs, enables personalized experience. Only premium platforms (Riley & Grey) do this well. |
| **Payment QR Code Registry** | Integrated cash fund with QR code for Venmo/PayPal/direct payment | Medium | None | Zero-fee cash funds are major draw. Joy offers this; Zola charges 2.5%. Direct QR integration is rare. |
| **Guest Photo Sharing** | Guests upload photos/videos via QR code; no app download | High | Photo Storage | Standalone apps (WedUploader, GuestCam) charge $50-150. Built-in = major value. Live slideshow display is premium. |
| **Multi-Event Support** | Separate RSVPs and visibility per event (rehearsal, ceremony, reception, brunch) | Medium | RSVP, Guest List | Riley & Grey and WedSites excel here. Control which guests see which events. |
| **Custom Domain** | couple.com instead of subdomain | Low | DNS Config | Standard differentiator at $15-20/year. Include free SSL. |
| **Seating Chart Builder** | Visual drag-drop seating arrangement synced with guest list | High | Guest List, RSVP | Zola, WeddingWire offer this. Reduces planning friction significantly. |
| **Digital Invitations/Save-the-Dates** | Matching digital stationery with tracking (opens, clicks) | Medium | Guest List, Templates | Lovebird and Paperless Post excel. Email + SMS delivery with analytics. |
| **Multilingual Support** | Multiple language versions of same site | High | All Content | WedSites charges premium. Huge value for international/multicultural weddings. Only 3-4 platforms offer true toggle support. |

### Medium-Value Differentiators

| Feature | Description | Complexity | Dependencies | Competitive Advantage |
|---------|-------------|------------|--------------|----------------------|
| **Real-time RSVP Dashboard** | Live tracking with visual progress, reminders for non-responders | Low | RSVP | Reduces couple anxiety. Auto-reminder emails for non-responders. |
| **Guest Messaging/Announcements** | Broadcast updates to all guests via email | Low | Guest List | Schedule changes, weather alerts, last-minute info. |
| **Day-of Timeline** | Shareable schedule for wedding day | Low | None | Helps guests and vendors coordinate. |
| **Vendor Contact List** | Store and share vendor info | Low | None | Useful for wedding party coordination. |
| **Audio Guestbook** | Voice messages from guests | Medium | Audio Storage | GuestCam includes free. Emotional keepsake feature. |
| **Dietary/Allergy Tracking** | Collect and export dietary restrictions by guest | Low | RSVP | Export for caterer. Table stakes for some, differentiator for completeness. |
| **QR Code Generation** | Auto-generate QR codes for printed materials | Low | None | Link to website, RSVP page, or photo upload. |

### Nice-to-Have Differentiators

| Feature | Description | Complexity | Dependencies | Notes |
|---------|-------------|------------|--------------|-------|
| **3D Floor Plan** | Visualize venue layout | High | Seating Chart | Prismm offers this. Overkill for most couples. |
| **Budget Tracker** | Track wedding expenses | Medium | None | The Knot has this. Useful but not website-core. |
| **Checklist/Planning Tools** | Wedding planning timeline | Medium | None | Already covered by many apps. Not core to website. |
| **Vendor Reviews/Directory** | Find local vendors | High | External Data | The Knot's moat. Don't compete here. |

## Anti-Features

Features to deliberately NOT build. These add complexity without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Extensive "Our Story" Editor** | Couples don't need WYSIWYG novel editors. Long love stories annoy guests seeking logistics. Adds complexity. | Simple text field with character limit (500-1000 chars). Focus on practical info. |
| **Social Media-Style Photo Feed** | Turns into content moderation nightmare. Guests posting inappropriate content. Couples don't want to police. | Moderated photo upload queue OR simple gallery (no comments/likes). |
| **In-Platform Messaging/Chat** | Creates expectation of real-time support. Couples don't want to be "on call" for guest questions. | Email forwarding to couple's real email. Contact form with clear response expectations. |
| **Complex E-commerce Registry** | Building Amazon/Zola-level product catalog is enormous undertaking. Inventory, shipping, returns = nightmare. | Cash funds with payment links. External registry aggregation (links to Amazon, Target, etc.). |
| **AI Wedding Planner/Chatbot** | Gimmick that will disappoint. Wedding planning is emotional, nuanced. AI will give bad advice. | Curated FAQ section. Human support for paying customers. |
| **Native Mobile Apps** | Doubles development surface. PWA achieves 95% of functionality. App store approval delays. | Progressive Web App (PWA) with "Add to Home Screen" prompt. |
| **Video Streaming** | Bandwidth costs explode. Live streaming is hard to do well. Laggy streams frustrate remote guests. | Embed YouTube/Vimeo links if couples want to stream elsewhere. Don't host video streaming. |
| **Vendor Booking/Payment** | Massive liability. Disputes between couples and vendors. Payment processing complexity. | Vendor contact list only. Leave booking to vendors' own systems. |
| **Full Wedding Planning Suite** | Trying to be The Knot + Zola + everything. Splits focus. | Stay focused on website + RSVP + registry. Do three things excellently vs. ten things poorly. |
| **User-Generated Templates** | QA nightmare. Couples submit broken/ugly designs. Support burden. | Professionally designed templates only. Customization within guardrails. |
| **Print Services** | Physical printing is different business entirely. Fulfillment, shipping, quality control. | Partner with print services (link out) or offer print-ready downloads. |
| **Guest Accommodation Booking** | Hotel APIs are complex. Commission structures. Liability for bookings. | Link to hotel websites. Provide block codes. Don't handle reservations. |

## Feature Dependencies

```
FOUNDATION (Build First)
=======================
Guest List Management
    |
    +---> RSVP System
    |         |
    |         +---> Multi-Event Support
    |         +---> Meal Selection
    |         +---> Dietary Tracking
    |         +---> RSVP Codes (enhances RSVP)
    |
    +---> Guest Messaging
    |
    +---> Seating Chart (requires finalized guest list)

Template System
    |
    +---> Website Builder
    |         |
    |         +---> Custom Domains
    |         +---> Photo Gallery
    |         +---> Event Details Pages
    |
    +---> Digital Invitations (matching design system)

User/Tenant System
    |
    +---> Admin Dashboard
    +---> Couple Dashboard
    +---> Guest Portal (password-protected site)

ADVANCED (Build Later)
=====================
Photo Storage Infrastructure
    |
    +---> Guest Photo Upload
    |         |
    |         +---> Live Slideshow
    |         +---> Moderation Queue
    |
    +---> Audio Guestbook

Payment Integration
    |
    +---> Cash Fund Registry
    +---> QR Code Payment Links
```

## MVP Recommendation

For MVP, prioritize in this order:

### Phase 1: Core Website
1. Template-based website builder (5-10 templates)
2. Basic event details pages
3. Mobile responsive design
4. Password protection
5. Custom subdomain

### Phase 2: Guest Management
1. Guest list management with CSV import
2. RSVP system with plus-ones, meal selection
3. Basic analytics dashboard

### Phase 3: Differentiators (Post-MVP)
1. RSVP codes/unique links
2. Custom domains
3. Cash fund with QR codes
4. Guest photo sharing
5. Multi-event support
6. Digital invitations

### Defer to Future Versions
- Seating chart builder (High complexity)
- Multilingual support (High complexity)
- Audio guestbook
- 3D floor plans
- Full wedding planning tools

## Competitive Landscape Summary

| Platform | Strengths | Weaknesses | Pricing Model |
|----------|-----------|------------|---------------|
| **Joy** | Free, zero-fee cash funds, 601 templates, mobile app | Design system less extensive, some editing needs desktop | Free (custom domain $20/yr) |
| **Zola** | Registry strength, 300+ templates, all-in-one | 2.5% cash fund fee, US-only registry, upselling | Free (custom domain $15) |
| **The Knot** | Vendor network, planning tools, 380 templates | Limited customization, intrusive ads | Free |
| **WedSites** | True multilingual, one-time fee, no ads | Smaller template library | One-time $99 |
| **Riley & Grey** | Premium design, advanced RSVP (multi-event, codes) | Expensive | $35-75/month |
| **Minted** | Beautiful design, stationery matching | Limited interactive features | $20 one-time |

**Market Gap Opportunity:** No platform does RSVP codes + cash fund QR + guest photo sharing well together. This combination at an affordable price point is the opportunity.

## Sources

- [Joy Wedding Website Features](https://withjoy.com/wedding-website/)
- [Joy RSVP Features](https://withjoy.com/online-rsvp/)
- [Joy Cash Fund Registry](https://withjoy.com/cash-fund-registry/)
- [Zola Wedding Websites](https://www.zola.com/wedding-planning/website)
- [The Knot Wedding Website Content Guide](https://www.theknot.com/content/what-to-put-on-your-wedding-website)
- [WedSites Best Builders 2025](https://blog.wedsites.com/best-wedding-website-builders/)
- [WedSites Multilingual Features](https://wedsites.com/multilingual-wedding-website)
- [Riley & Grey RSVPs](https://www.rileygrey.com/wedding-rsvps)
- [GuestCam Photo Sharing](https://guestcam.co/)
- [WedUploader Photo Sharing](https://weduploader.com/)
- [Honeyfund Cash Registries](https://www.honeyfund.com/best-cash-registries)
- [RSVPify QR Codes](https://rsvpify.com/qr-codes-for-wedding-invitations/)
- [Common Wedding Website Mistakes](https://blog.wedsites.com/10-common-mistakes-couples-make-on-their-wedding-website-and-how-to-avoid-them/)
- [David's Bridal Wedding Website Guide](https://pearl.davidsbridal.com/inspiration/advice/what-to-include-on-your-wedding-website-in-2025/)
- [Junebug Weddings Best Platforms](https://junebugweddings.com/wedding-blog/eight-best-wedding-websites-every-couple-should-know/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
