# Pitfalls Research: Wedding Website Platform

**Domain:** Multi-tenant SaaS wedding website platform
**Researched:** 2026-01-16
**Confidence:** MEDIUM-HIGH (synthesized from multiple industry sources, wedding platform user feedback, and SaaS architecture patterns)

---

## Critical Pitfalls

Mistakes that can kill the project or require major rewrites.

### 1. Tenant Data Isolation Failure

**Description:** In a shared database with tenant_id approach, a missing WHERE clause or improper join exposes one couple's guest list, RSVP responses, or payment information to another couple. This is a trust-destroying, potentially lawsuit-inducing failure.

**Warning signs:**
- Queries written without mandatory tenant filtering
- No automated tests verifying tenant isolation
- API endpoints that accept tenant_id as a parameter (allowing spoofing)
- Database queries that join across tenants without explicit scoping
- Developers manually adding tenant_id checks inconsistently

**Prevention:**
- Enforce tenant context at the data access layer (not application layer)
- Use row-level security (RLS) in PostgreSQL or equivalent
- Add tenant_id to ALL tables, including junction tables
- Write integration tests that explicitly attempt cross-tenant data access
- Never expose tenant_id in URLs or allow it as user input
- Derive tenant from authenticated session, never from request parameters

**Address in:** Phase 1 (Foundation) - This must be architected correctly from day one. Retrofitting tenant isolation is extremely painful.

**Sources:** [Multi-tenant database design patterns](https://medium.com/@harishsingh8529/why-your-multi-tenant-database-design-is-probably-wrong-and-how-to-fix-it-before-its-too-late-c543b777106a), [Clerk multi-tenancy risks](https://clerk.com/blog/what-are-the-risks-and-challenges-of-multi-tenancy)

---

### 2. Custom Domain SSL Certificate Management Nightmare

**Description:** Supporting custom domains (e.g., `sarah-and-john.com`) requires per-domain SSL certificates. Manual management becomes impossible at scale. A single misconfigured domain can break certificate generation for all domains. Let's Encrypt rate limits (50 certs/domain/week) can throttle onboarding.

**Warning signs:**
- Manual SSL certificate provisioning process
- No automated renewal pipeline
- Single certificate covering multiple tenant domains (privacy issue: tenants see each other's domains)
- Hitting Let's Encrypt rate limits during growth spikes
- Certificate validation failures blocking deployments

**Prevention:**
- Use Cloudflare for SaaS, AWS CloudFront multi-tenant distributions, or similar managed solutions
- Implement automated ACME (Let's Encrypt) HTTP-01 challenge handling
- Build certificate lifecycle management: provision, validate, renew, revoke
- Validate domain ownership BEFORE attempting certificate generation
- Plan for rate limits: queue certificate requests, implement backoff
- Budget appropriately - managed solutions like Cloudflare for SaaS have costs but save engineering time

**Address in:** Phase 2 (Core Features) or Phase 3 - Custom domains are a premium feature, but architecture must anticipate it. Don't bolt it on later.

**Sources:** [Wildcard TLS for multi-tenant systems](https://www.skeptrune.com/posts/wildcard-tls-for-multi-tenant-systems/), [Scalable multi-tenant architecture for custom domains](https://dev.to/peter_dyakov_06f3c69a46b7/scalable-multi-tenant-architecture-for-hundreds-of-custom-domains-56mn)

---

### 3. Wedding Day Traffic Spike Crash

**Description:** All guests access the site simultaneously on the wedding day - viewing the schedule, RSVPing last-minute, checking venue directions. This 10-100x traffic spike crashes an under-provisioned system exactly when it matters most. Couples will never forgive downtime on their wedding day.

**Warning signs:**
- No load testing performed
- Shared hosting or single-server architecture
- No caching layer (CDN, application cache)
- Database queries that don't scale (N+1, missing indexes)
- No monitoring or alerting for performance degradation
- Assuming steady traffic patterns

**Prevention:**
- Implement CDN for all static assets and cached pages
- Use read replicas or caching for high-read workloads (schedule, venue info)
- Load test with realistic wedding-day scenarios (100+ concurrent users per site)
- Implement graceful degradation (static fallback pages)
- Pre-warm caches before known wedding dates
- Consider wedding-date-aware auto-scaling triggers
- Design for 10x expected peak, test for 100x

**Address in:** Phase 1 (Foundation) for architecture decisions, Phase 2 for implementation, ongoing for monitoring.

**Sources:** [Website traffic spike prevention](https://queue-it.com/blog/how-high-online-traffic-can-crash-your-website/), [Handle traffic spikes](https://www.webdevelopmentgroup.com/insights/how-to-handle-traffic-spikes/)

---

### 4. RSVP Guest Counting Logic Bugs

**Description:** RSVP systems that miscalculate guest counts ruin catering orders, seating charts, and budgets. Edge cases: plus-ones who don't RSVP separately, household groupings where only one person responds, guests using nicknames, duplicate submissions, children not counted correctly.

**Warning signs:**
- Guest count discrepancies between RSVP list and totals
- Couples manually reconciling numbers in spreadsheets
- Plus-ones appearing as separate guests or not at all
- Meal choice totals not matching guest totals
- "Nickname problem" - guests enter "Mike" but invitation said "Michael"

**Prevention:**
- Model guests in households/parties with clear relationships
- Plus-ones tied to inviting guest, not independent records
- Fuzzy name matching with manual override
- Enforce "RSVP for all members of your party" in single submission
- Meal choices attached to individual guests, not households
- Audit trail for all RSVP changes
- Dashboard showing: invited (X), responded (Y), attending (Z), meals (breakdown)
- Reconciliation tools for couples to fix mismatches

**Address in:** Phase 2 (RSVP feature) - Get the data model right before building UI. Test with real wedding scenarios.

**Sources:** [Wedding Wire RSVP tracking issues](https://www.weddingwire.com/wedding-forums/rsvps-meal-option-tracking/0c2c6f94d503dc0a.html), [Joy Smart RSVP](https://withjoy.com/blog/11-top-rated-wedding-websites-with-rsvp-features-real-couples-picks/)

---

### 5. European Payment Method Fragmentation

**Description:** Switzerland requires TWINT and bank transfer. Germany wants SOFORT. Netherlands needs iDEAL. PayPal has regional quirks. Ignoring local payment preferences means couples can't receive gifts through your platform.

**Warning signs:**
- Only supporting credit cards
- Payment method selection not matching target market
- TWINT integration failing silently (logo configuration issue)
- PayPal Reference Transactions not enabled for recurring
- Bank transfer reconciliation manual and error-prone
- PSD2/SCA compliance failures causing transaction rejections

**Prevention:**
- Research target market payment preferences deeply
- For Switzerland specifically: TWINT + bank transfer are "must-haves"
- Use payment orchestration layer (Stripe, Datatrans) supporting multiple methods
- Test TWINT registration flow specifically (known logo configuration issue)
- Implement automated bank transfer reconciliation with reference codes
- Handle SCA (Strong Customer Authentication) requirements for EU
- Budget 15-20% higher decline rates in EU vs US

**Address in:** Phase 2 or 3 (Gift Registry/Payment) - Payment method support is critical for gift registry feature.

**Sources:** [Datatrans payment methods](https://docs.datatrans.ch/docs/payment-methods), [Stripe TWINT documentation](https://docs.stripe.com/payments/twint), [European payment challenges](https://gr4vy.com/posts/the-future-of-payments-in-europe-why-payment-orchestration-is-essential-in-2025/)

---

## Common Mistakes

Mistakes that cause significant pain but are recoverable.

### 6. Post-Wedding Lifecycle Neglect

**Description:** Platform deletes wedding sites unexpectedly, couples lose access to guest lists and photos, no export option, data disappears without warning. Wedding memories are emotionally charged - losing them destroys trust.

**Warning signs:**
- No clear data retention policy communicated to users
- No export functionality for couples
- Automatic deletion without warnings
- Photos stored without backup
- Couples asking "what happens after the wedding?"

**Prevention:**
- Clear retention policy: "Your site stays up for X months after wedding date"
- Multiple email warnings before any deletion (30 days, 7 days, 1 day)
- Self-service export: guest list CSV, photos ZIP, site archive
- Option to extend (paid or free)
- GDPR-compliant: allow full deletion on request
- Consider: "memory mode" - read-only archive couples can keep

**Address in:** Phase 3 or 4 - Not MVP, but plan the data model to support it.

**Sources:** [The Knot post-wedding policies](https://www.theknot.com/content/what-to-do-with-wedding-website-after-wedding), [WeddingWire data loss complaints](https://www.weddingwire.com/wedding-forums/help-my-wedding-website-and-account-are-gone/aa00f7f23ebdf669.html)

---

### 7. Photo Storage Cost Explosion

**Description:** Guest photo sharing generates massive storage costs. 200 guests uploading 10 photos each at 5MB = 10GB per wedding. At 1000 weddings, that's 10TB. Without limits or tiered storage, costs explode.

**Warning signs:**
- No per-wedding storage quotas
- Original resolution stored without compression
- No cleanup of abandoned/expired weddings
- Storage costs growing faster than revenue
- No differentiation between free and paid tiers

**Prevention:**
- Implement storage quotas per plan tier
- Compress and resize images on upload (keep originals optional/paid)
- Move old wedding photos to cold storage (S3 Glacier, etc.)
- Automatic cleanup X months after wedding (with warnings)
- Consider: guest uploads to couple's own Google Drive/cloud
- Show storage usage in couple dashboard
- Calculate: storage cost per wedding into pricing model

**Address in:** Phase 2 or 3 (Photo Sharing) - Build quotas and compression from start.

**Sources:** [Wedding photo storage costs](https://waldophotos.com/photo-sharing-sites-for-wedding-guests/), [WedUploader approach](https://weduploader.com/)

---

### 8. Theme Customization Trap

**Description:** Either too rigid (couples complain "looks like everyone else") or too flexible (couples break layouts, support nightmare, mobile responsiveness issues). Pixel-perfect customization on desktop breaks mobile. Template lock-in frustrates users.

**Warning signs:**
- User complaints about "cookie-cutter" sites
- Support tickets about broken layouts after customization
- Mobile responsiveness issues after custom changes
- Couples asking for features outside template constraints
- Template switch destroying previous customizations

**Prevention:**
- Design for "constrained creativity" - flexible within guardrails
- Pre-defined color palettes, font pairings (not arbitrary)
- Component-based customization (move sections, not pixels)
- Mobile preview mandatory during editing
- Test templates at extremes (long names, no photos, 500 guests)
- Save customizations separately from template structure
- Consider: "advanced mode" for power users, simple mode for most

**Address in:** Phase 2 (Site Builder) - Core architecture decision affecting all future development.

**Sources:** [Wedding website builder limitations](https://www.seedprod.com/best-wedding-website-builders/), [Joy platform constraints](https://withjoy.com/blog/how-to-pick-the-best-wedding-website-builder-a-stress-free-guide-for-2025/)

---

### 9. Guest Code Access Security Theater

**Description:** Guest codes meant to provide "invite-only" access are easily guessable (couple's names, wedding date, "iloveyou"). Codes shared in group chats spread beyond intended guests. No rate limiting enables brute-force guessing.

**Warning signs:**
- Simple/predictable default codes
- No rate limiting on code entry
- Codes stored in plain text
- No logging of access attempts
- Couples unaware their code was shared widely
- Uninvited "joke RSVPs" from strangers

**Prevention:**
- Generate random codes, discourage meaningful words
- Rate limit code attempts (5 failures = 15 min lockout)
- Optional: per-guest unique codes for tracking
- Audit log of code usage visible to couple
- Allow couples to regenerate codes easily
- Consider: email/SMS verification for sensitive actions (RSVP)
- CAPTCHA after failed attempts

**Address in:** Phase 1 (Auth) or Phase 2 (Guest Access) - Security must be baked in early.

**Sources:** [Wedding website privacy concerns](https://www.rileygrey.com/wedding-guide/wedding-planning/safeguarding-your-big-day-ensuring-wedding-website-security-and-privacy), [The Knot RSVP privacy](https://www.theknot.com/content/do-i-include-reply-cards-if-guests-rsvp-online)

---

### 10. "Noisy Neighbor" Database Performance

**Description:** One couple with 800 guests running complex queries slows down the entire platform. Shared database without resource limits means one tenant's actions affect all tenants.

**Warning signs:**
- Intermittent slowdowns affecting all users
- Single large wedding causing platform-wide issues
- No query timeout or resource limits
- No per-tenant performance monitoring
- Support complaints clustered around specific weddings

**Prevention:**
- Query timeouts and connection limits per tenant
- Index heavily on tenant_id + common query patterns
- Connection pooling with per-tenant limits
- Monitor slow queries, identify problematic patterns
- Consider: read replicas for heavy read operations
- Rate limit API calls per tenant
- Offload heavy operations (photo processing, exports) to async queues

**Address in:** Phase 1 (Foundation) for architecture, ongoing for monitoring and optimization.

**Sources:** [Noisy neighbor SaaS problem](https://wefttechnologies.com/blog/how-to-architect-a-multi-tenant-saas-that-grows-gracefully/), [Azure multi-tenant patterns](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns)

---

## Wedding-Specific Concerns

Domain-specific issues unique to wedding websites that general SaaS patterns don't cover.

### 11. The One-Shot Nature of Weddings

**Description:** Unlike most SaaS, users cannot "try again next month." The wedding is a single, irreplaceable event. Bugs discovered on the wedding day cannot be fixed in a patch. This creates asymmetric consequences for failures.

**Warning signs:**
- Treating wedding sites like normal web apps
- No pre-wedding testing checklist for couples
- Support unavailable on weekends (prime wedding days)
- "Move fast and break things" culture

**Prevention:**
- Extensive testing before any feature reaches wedding-week users
- Feature freeze X days before wedding date
- Weekend support coverage (even if limited)
- Pre-wedding checklist: "Test your RSVP", "Verify your venue map works"
- Incident response plan for wedding-day issues
- Consider: "dry run" feature for couples to test guest experience

**Address in:** All phases - This is a cultural/process consideration, not just technical.

---

### 12. Emotional Sensitivity of Data

**Description:** Wedding data is uniquely emotional. A bug deleting the guest book messages, photos from the wedding, or the RSVP yes from grandma causes disproportionate distress. Generic "data was lost" isn't acceptable.

**Warning signs:**
- No backup strategy for user-generated content
- Deletion operations that can't be undone
- No audit trail for data changes
- Error messages that are technical rather than empathetic

**Prevention:**
- Soft delete everything, hard delete only after grace period
- Automatic backups with point-in-time recovery
- Audit trail for all user-generated content changes
- Recovery procedures documented and tested
- Error messages acknowledging emotional context
- Consider: "trash" feature for accidental deletions

**Address in:** Phase 1 (Data model) - Build soft delete and audit from start.

---

### 13. Family Drama Management

**Description:** Divorced parents shouldn't be seated together. Some guests shouldn't see others' RSVPs. Complex family situations require private vs public information. The platform can inadvertently expose family tensions.

**Warning signs:**
- No ability to hide certain guests from public guest list
- Seating chart visible to all guests
- RSVP status publicly visible
- Plus-ones for exes visible to current partners

**Prevention:**
- Granular privacy controls: what guests see vs what couple sees
- Private notes on guests (visible only to couple)
- Seating chart visible only to couple by default
- RSVP status private by default, opt-in to share
- Consider: separate "guest-facing" vs "couple-facing" views

**Address in:** Phase 2 (RSVP/Guest Management) - Privacy controls in data model.

---

### 14. GDPR and Guest Data Compliance

**Description:** Guest lists contain PII (names, emails, addresses, dietary requirements which may reveal health/religious info). European guests have GDPR rights. Data brokers target wedding sites for personal information harvesting.

**Warning signs:**
- No privacy policy specific to guest data
- Guest data used for marketing without consent
- No data export/deletion for guests
- Search engines indexing guest information
- Long retention of guest PII after wedding

**Prevention:**
- Clear privacy policy covering guest data
- Couples are data controllers; platform is processor
- Guest data deletion after configurable retention period
- No search engine indexing of guest-specific pages
- Consent checkbox if using data beyond RSVP functionality
- Data export for GDPR subject access requests
- Consider: option to not require guest email for RSVP

**Address in:** Phase 1 (Legal/Compliance) - GDPR must be designed in, not bolted on.

**Sources:** [WedSites privacy policy](https://wedsites.com/privacy), [GDPR wedding considerations](https://www.amostcuriousweddingfair.co.uk/GDPR-all-you-need)

---

### 15. The "Day After" Problem

**Description:** Platform designed for pre-wedding becomes awkward post-wedding. RSVP buttons on past events, countdown timers showing negative days, thank-you cards not supported, photo sharing continues but site feels stale.

**Warning signs:**
- No post-wedding mode/state
- RSVP still accepting responses after wedding
- Countdown showing "-14 days until wedding"
- No photo upload from professional photographer
- No thank-you card tracking

**Prevention:**
- Wedding date triggers automatic mode switch
- Post-wedding mode: hide RSVP, show photos, enable thank-you tracking
- Convert countdown to "X days married"
- Bulk photo upload for professional photographer gallery
- Optional: anniversary countdown, memory sharing
- Export to long-term archive (couple's own storage)

**Address in:** Phase 3 or 4 - Design data model to support lifecycle states.

---

## Phase-Specific Warning Summary

| Phase | Critical Pitfalls to Address | Research Flags |
|-------|------------------------------|----------------|
| Phase 1: Foundation | Tenant isolation (#1), Traffic architecture (#3), Database performance (#10), Soft delete (#12), GDPR foundation (#14) | Standard patterns, low research risk |
| Phase 2: Core Features | Guest counting (#4), Theme customization (#8), Guest code security (#9), Privacy controls (#13) | RSVP logic needs careful modeling |
| Phase 3: Premium Features | SSL/Custom domains (#2), Payment methods (#5), Photo storage (#7), Post-wedding mode (#15) | Payment integration needs market-specific research |
| Phase 4: Scale & Polish | Lifecycle management (#6), Noisy neighbor mitigation (#10) | Operational concerns |

---

## Sources Summary

**Multi-tenant SaaS Architecture:**
- [WorkOS multi-tenant guide](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [Clerk multi-tenancy risks](https://clerk.com/blog/what-are-the-risks-and-challenges-of-multi-tenancy)
- [Medium: multi-tenant database mistakes](https://medium.com/@harishsingh8529/why-your-multi-tenant-database-design-is-probably-wrong-and-how-to-fix-it-before-its-too-late-c543b777106a)
- [Azure multi-tenant patterns](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data)

**Custom Domains & SSL:**
- [Multi-tenant wildcard TLS](https://www.skeptrune.com/posts/wildcard-tls-for-multi-tenant-systems/)
- [Custom domains architecture](https://dev.to/peter_dyakov_06f3c69a46b7/scalable-multi-tenant-architecture-for-hundreds-of-custom-domains-56mn)
- [Azure domain considerations](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/domain-names)

**Wedding Platform User Feedback:**
- [The Knot post-wedding](https://www.theknot.com/content/what-to-do-with-wedding-website-after-wedding)
- [Joy wedding websites](https://withjoy.com/blog/how-to-pick-the-best-wedding-website-builder-a-stress-free-guide-for-2025/)
- [Wedding Wire forums](https://www.weddingwire.com/wedding-forums/)
- [Riley & Grey security guide](https://www.rileygrey.com/wedding-guide/wedding-planning/safeguarding-your-big-day-ensuring-wedding-website-security-and-privacy)

**Payment Processing:**
- [Stripe TWINT](https://docs.stripe.com/payments/twint)
- [Datatrans payment methods](https://docs.datatrans.ch/docs/payment-methods)
- [European payment challenges](https://gr4vy.com/posts/the-future-of-payments-in-europe-why-payment-orchestration-is-essential-in-2025/)

**Performance & Scalability:**
- [Queue-IT traffic management](https://queue-it.com/blog/how-high-online-traffic-can-crash-your-website/)
- [WebsitePulse high traffic](https://www.websitepulse.com/blog/how-to-avoid-website-crashes-despite-high-traffic)
