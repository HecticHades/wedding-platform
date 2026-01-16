# Project Research Summary

**Project:** Wedding Website Platform
**Domain:** Multi-tenant SaaS
**Researched:** 2026-01-16
**Confidence:** HIGH

## Executive Summary

Building a multi-tenant wedding website SaaS with custom domains, RSVP management, gift registries with payment QR codes, and photo sharing is a well-understood problem with mature patterns. The recommended stack is **Next.js 15 + PostgreSQL + Prisma + Clerk + shadcn/ui + Cloudflare R2 + Vercel**. This combination is battle-tested for multi-tenant applications, with Vercel's Platforms Starter Kit proving the exact multi-tenancy pattern needed. The stack prioritizes developer experience and time-to-market while remaining scalable.

The architecture uses a shared PostgreSQL database with tenant_id columns and Row-Level Security for isolation. Wedding sites are ephemeral (6-18 month lifecycle) with modest data volumes per tenant, making schema-per-tenant or database-per-tenant massive overkill. Subdomain routing via Next.js middleware handles `yourwedding.platform.com` patterns, with custom domain support added via CNAME verification and automated SSL provisioning.

The critical risks center around tenant data isolation failures (exposing one couple's guest list to another), wedding-day traffic spikes (10-100x normal load when all guests access simultaneously), and RSVP counting logic bugs (incorrect headcounts ruin catering and seating). These must be addressed in Phase 1 architecture, not bolted on later. Secondary risks include European payment fragmentation (TWINT/bank transfer are mandatory in Switzerland) and photo storage costs exploding without quotas.

## Key Findings

### Recommended Stack

The stack is modern TypeScript-first, optimized for multi-tenant SaaS with minimal operational overhead. All choices have HIGH confidence based on official documentation and proven patterns.

**Core technologies:**
- **Next.js 15**: Full-stack framework with native multi-tenant support via middleware. Server Actions simplify forms. Vercel Platforms Starter Kit proves the pattern.
- **PostgreSQL + Neon**: Serverless Postgres with RLS for tenant isolation. JSON columns for flexible wedding settings. Scales to zero for cost-effective development.
- **Prisma**: Type-safe ORM with best-in-class DX. Prisma Studio aids debugging. Migration tooling mature.
- **Clerk**: Purpose-built for multi-tenant B2B SaaS. Organizations feature = couple accounts. Pre-built auth UI. $0.02/MAU is predictable.
- **Cloudflare R2**: S3-compatible storage with zero egress fees. Critical for photo-heavy sites where 10GB viewed 100x would cost $90 on S3 vs $0 on R2.
- **shadcn/ui + Tailwind**: Copy-paste components with full ownership. Wedding sites need custom branding; shadcn allows complete control.

**Payment integration note:** TWINT has no public API. Must integrate via payment service provider (Adyen, Worldline). PayPal and bank transfer QR codes are straightforward.

### Expected Features

**Must have (table stakes):**
- Customizable website builder with templates (79% of couples use wedding websites as primary communication)
- RSVP system with plus-ones, meal selection, dietary restrictions
- Guest list management with CSV import
- Event details pages with maps
- Mobile responsive design
- Password protection for privacy
- Custom subdomain (free tier)
- Basic photo gallery

**Should have (competitive):**
- RSVP codes/unique links per guest (prevents unauthorized RSVPs)
- Payment QR code registry (zero-fee cash funds; Zola charges 2.5%)
- Guest photo sharing via QR (no app download)
- Custom domains ($15-20/year premium feature)
- Multi-event support (separate RSVPs for rehearsal, ceremony, reception)
- Digital invitations with tracking

**Defer (v2+):**
- Seating chart builder (high complexity)
- Multilingual support (high complexity)
- Audio guestbook
- Full wedding planning tools
- 3D floor plans

**Market gap opportunity:** No platform does RSVP codes + cash fund QR + guest photo sharing well together at an affordable price point.

### Architecture Approach

Single Next.js codebase with shared PostgreSQL database using tenant_id columns and Row-Level Security. Middleware extracts tenant from subdomain/custom domain and injects context into all requests. All DB queries scoped to tenant. CDN-backed media storage via Cloudflare R2 with presigned URLs for direct uploads.

**Major components:**
1. **Edge Layer** (Cloudflare + Vercel) - Wildcard subdomain routing, SSL termination, CDN for static assets
2. **Application Layer** (Next.js) - Middleware for tenant context, Server Actions for mutations, API Routes for webhooks
3. **Auth Layer** (Clerk) - Couple accounts via Organizations, guest access via codes (no account required)
4. **Data Layer** (Neon PostgreSQL + Prisma) - Tenant-scoped tables with RLS, JSONB for flexible settings
5. **Media Pipeline** (Cloudflare R2) - Presigned uploads, CDN delivery, image optimization
6. **Integrations** - Resend for email, Adyen for payments (TWINT), qrcode.react for QR generation

### Critical Pitfalls

1. **Tenant data isolation failure** - Missing WHERE clause exposes one couple's data to another. Prevention: enforce tenant context at data access layer, use PostgreSQL RLS, never expose tenant_id in URLs, derive tenant from session only. Address in Phase 1.

2. **Wedding-day traffic spike crash** - All guests access simultaneously (10-100x spike). Prevention: CDN all static assets, load test with 100+ concurrent users per site, pre-warm caches before wedding dates, design for 10x expected peak. Address in Phase 1 architecture.

3. **RSVP guest counting bugs** - Miscounts ruin catering and seating. Plus-ones, households, nicknames create edge cases. Prevention: model guests in households with clear relationships, plus-ones tied to inviting guest, enforce "RSVP for all party members" in single submission, reconciliation tools for couples. Address in Phase 2.

4. **European payment fragmentation** - Switzerland requires TWINT and bank transfer. Prevention: use payment orchestration layer (Adyen), test TWINT registration flow specifically, implement automated bank transfer reconciliation. Address in Phase 3.

5. **Photo storage cost explosion** - 200 guests x 10 photos x 5MB = 10GB per wedding. Prevention: storage quotas per tier, compress on upload, move old photos to cold storage, show usage in dashboard. Address in Phase 3.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Tenant isolation, authentication, and database schema must be correct from day one. Retrofitting multi-tenant security is extremely painful. Traffic architecture decisions made here affect all future development.
**Delivers:** Multi-tenant infrastructure, couple authentication, subdomain routing, base database schema
**Addresses:** Custom subdomain (table stakes)
**Avoids:** Tenant data isolation failure (#1), noisy neighbor database (#10), GDPR foundation (#14)
**Stack focus:** Next.js middleware, PostgreSQL + Prisma + RLS, Clerk Organizations

### Phase 2: Core Wedding Features
**Rationale:** Guest management is foundation for RSVP. RSVP is the most critical planning tool. Website builder can be built in parallel. These are table stakes without which the platform has no value.
**Delivers:** Guest list management, event management, RSVP system, basic website builder
**Uses:** Prisma for data modeling, React Hook Form + Zod for forms, shadcn/ui for components
**Implements:** Guest portal with code access, couple dashboard, wedding website rendering
**Avoids:** RSVP guest counting bugs (#4), theme customization trap (#8), guest code security (#9)

### Phase 3: Differentiators
**Rationale:** These features justify charging money and differentiate from free competitors. Payment integration and photo sharing have infrastructure complexity best tackled after core features stabilize.
**Delivers:** Gift registry with QR payments, guest photo sharing, custom domains
**Uses:** Cloudflare R2 for photos, Adyen for payments, ACME for SSL
**Avoids:** Payment fragmentation (#5), photo storage explosion (#7), SSL certificate nightmare (#2)

### Phase 4: Polish and Scale
**Rationale:** Post-wedding lifecycle, notifications, and analytics are valuable but not launch-blocking. Build after core product proves market fit.
**Delivers:** Post-wedding mode, email notifications, analytics dashboard, data export
**Avoids:** Post-wedding lifecycle neglect (#6), "day after" problem (#15)

### Phase Ordering Rationale

- **Foundation first:** Tenant isolation and auth decisions cascade to every other feature. Cannot be retrofitted.
- **Guest/RSVP before registry/photos:** Guest list is dependency for everything else. RSVP is core value prop.
- **Website builder parallel with RSVP:** No hard dependency, can build simultaneously by different developers.
- **Payments/photos in Phase 3:** Infrastructure complexity, payment provider approval timelines, storage cost modeling all need more attention than table-stakes features.
- **Post-wedding lifecycle deferred:** Nice-to-have but couples will forgive imperfect sunset experience at launch.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Payments):** TWINT integration requires PSP account setup and approval. Needs market-specific research for target countries. Bank transfer reconciliation automation needs business process design.
- **Phase 3 (Custom Domains):** SSL certificate automation (Let's Encrypt rate limits, DNS verification) needs careful implementation research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Multi-tenant Next.js patterns well-documented. Vercel Platforms Starter Kit provides reference implementation.
- **Phase 2 (RSVP/Guest Management):** Standard CRUD with careful data modeling. Wedding-specific edge cases documented in PITFALLS.md.
- **Phase 2 (Website Builder):** Template systems well understood. shadcn/ui + Tailwind theming documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs. Vercel Platforms Starter Kit proves multi-tenant pattern. |
| Features | HIGH | Based on analysis of 15+ competitor platforms. Market gaps identified with specificity. |
| Architecture | MEDIUM-HIGH | Patterns well-established; wedding-specific details inferred from analogous systems. |
| Pitfalls | MEDIUM-HIGH | Synthesized from industry sources, wedding platform user feedback, and SaaS patterns. |

**Overall confidence:** HIGH

### Gaps to Address

- **TWINT integration specifics:** Must get PSP account and test actual integration. Documentation sparse outside PSP contexts.
- **Storage cost projections:** Need real data on average photos per wedding to validate R2 cost model.
- **Guest code UX:** Balance between security (random codes) and usability (memorable codes). Needs user testing.
- **Post-wedding data retention:** Legal/compliance team should define retention policy. GDPR requirements vary by country.

## Cross-Cutting Concerns

Themes that appeared across multiple research areas:

1. **Wedding-day reliability is non-negotiable:** Unlike normal SaaS, weddings cannot "try again next month." Traffic spikes, data integrity, and uptime on the wedding day are existential concerns. Architecture, testing, and operational planning must account for this.

2. **Tenant isolation pervades everything:** Database queries, file storage paths, API authorization, guest codes - every layer must enforce tenant boundaries. This is not a feature; it is a foundational requirement.

3. **Emotional sensitivity of wedding data:** Generic error messages and casual data loss are unacceptable. Soft deletes, audit trails, empathetic error handling, and robust backups required throughout.

4. **Privacy complexity:** Family drama, GDPR, guest visibility controls - privacy is not a checkbox feature but a design constraint affecting data model, UI, and business logic.

5. **Ephemeral but high-stakes:** Wedding sites are short-lived (6-18 months) but intensely used. Design for graceful sunsetting, data export, and lifecycle transitions.

## Roadmap Inputs

Concrete inputs for phase planning:

**Phase 1 duration estimate:** 2-3 weeks (foundation complexity is moderate, Vercel starter kit helps)

**Phase 2 duration estimate:** 4-6 weeks (RSVP logic needs careful testing, website builder has template work)

**Phase 3 duration estimate:** 4-6 weeks (payment integration has external dependencies, photo pipeline needs optimization)

**Phase 4 duration estimate:** 2-3 weeks (polish and lifecycle features are well-scoped)

**Key dependencies:**
- Clerk account setup (Phase 1 blocker)
- Neon database provisioning (Phase 1 blocker)
- Adyen/payment PSP account and approval (Phase 3 blocker, start early)
- Custom domain DNS infrastructure (Phase 3)

**MVP definition:** Phases 1 + 2 = minimum viable product. Couples can create sites, manage guests, collect RSVPs. Differentiator features (Phase 3) justify paid tiers.

## Sources

### Primary (HIGH confidence)
- [Next.js 15 Documentation](https://nextjs.org/docs) - Multi-tenant guide, middleware, Server Actions
- [Vercel Platforms Starter Kit](https://github.com/vercel/platforms) - Reference multi-tenant implementation
- [Clerk Multi-tenant Guide](https://clerk.com/blog/how-to-design-multitenant-saas-architecture) - Organization feature patterns
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) - Tenant isolation patterns

### Secondary (MEDIUM confidence)
- [Joy Wedding Website](https://withjoy.com/) - Feature benchmarking, RSVP patterns
- [Zola Wedding Platform](https://www.zola.com/) - Registry patterns, pricing models
- [WorkOS Multi-tenant Guide](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture) - Architecture patterns
- [Cloudflare R2 Pricing](https://www.cloudflare.com/developer-platform/r2/) - Storage cost model

### Tertiary (LOW confidence)
- Wedding forum user feedback (WeddingWire, The Knot forums) - Pain points, feature requests
- Individual blog posts on wedding platform architecture - General patterns, needs validation

---
*Research completed: 2026-01-16*
*Ready for roadmap: yes*
