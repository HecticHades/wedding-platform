# Architecture Research: Wedding Website Platform

**Domain:** Multi-tenant SaaS wedding website platform
**Researched:** 2026-01-16
**Confidence:** MEDIUM-HIGH (patterns well-established; wedding-specific details inferred from analogous systems)

## Executive Summary

A multi-tenant wedding website SaaS platform requires a shared-database architecture with row-level tenant isolation, subdomain/custom domain routing at the edge, and clear separation between admin, couple, and guest user experiences. The architecture prioritizes simplicity over enterprise isolation since wedding websites are ephemeral (6-18 month lifecycle) with modest per-tenant data volumes.

**Recommended approach:** Single codebase, shared PostgreSQL database with tenant_id columns, wildcard subdomain routing via middleware, CDN-backed media storage.

---

## System Components

### 1. Edge Layer (Routing + SSL)

**Responsibility:** Route requests to correct tenant, handle custom domains, SSL termination

| Component | Purpose | Technology Options |
|-----------|---------|-------------------|
| DNS | Wildcard subdomain + custom domain CNAME | Cloudflare, Route53, Vercel DNS |
| SSL/TLS | Wildcard cert for subdomains, ACME for custom domains | Let's Encrypt with DNS-01 validation |
| CDN | Static asset delivery, edge caching | Cloudflare, CloudFront, Vercel Edge |

**Key decision:** Use wildcard certificates for `*.weddingplatform.com` subdomains. For custom domains, implement ACME automation with DNS-01 challenges. Per-tenant certificates don't scale past a few hundred tenants.

### 2. Application Layer

**Responsibility:** Business logic, tenant context, API endpoints

| Component | Purpose | Notes |
|-----------|---------|-------|
| Middleware | Extract tenant from subdomain/domain, inject context | Runs at edge for performance |
| API Routes | CRUD operations for all entities | Tenant-scoped by default |
| SSR/SSG | Render couple websites for guests | Can pre-render popular pages |
| Admin Dashboard | Platform admin operations | Separate route group |
| Couple Dashboard | Website customization, guest management | Tenant-scoped |
| Guest Portal | RSVP, registry viewing, photos | Code-gated access |

### 3. Authentication Layer

**Responsibility:** User identity, access control

| User Type | Auth Method | Session Strategy |
|-----------|-------------|------------------|
| Platform Admin | Email/password + MFA | JWT with refresh tokens |
| Couple | Email/password, OAuth (Google) | JWT, tied to tenant |
| Guest | Access code (no account required) | Short-lived session token |

**Guest access code pattern:** Couples generate alphanumeric codes (e.g., `SMITH2026`). Guests enter code to access RSVP/photos. No account creation required. Code validates against tenant's guest list or serves as general access code.

### 4. Data Layer

**Responsibility:** Persistent storage, tenant isolation

| Component | Purpose | Technology |
|-----------|---------|------------|
| Primary DB | Relational data (users, RSVPs, settings) | PostgreSQL |
| Object Storage | Photos, uploaded media | S3/R2/Spaces with CDN |
| Cache | Session data, hot queries | Redis/Upstash |
| Search (optional) | Guest list search at scale | PostgreSQL full-text initially |

### 5. Media Pipeline

**Responsibility:** Photo upload, processing, delivery

| Stage | Purpose | Technology |
|-------|---------|------------|
| Upload | Accept photos from couples/guests | Pre-signed URLs to object storage |
| Processing | Resize, optimize, generate thumbnails | Image CDN (Cloudinary, Cloudflare Images) or async jobs |
| Storage | Persist originals + variants | S3/R2 with lifecycle policies |
| Delivery | Serve optimized images to clients | CDN with on-the-fly transforms |

### 6. External Integrations

**Responsibility:** Third-party services

| Integration | Purpose | Implementation |
|-------------|---------|----------------|
| Email | Notifications, RSVP confirmations | SendGrid, Resend, SES |
| Payment QR | Gift fund contributions | Deep link to payment apps (Venmo, PayPal) |
| Registry Links | External registry aggregation | URL storage + iframes/links |
| Calendar | Add-to-calendar for events | iCal file generation |

---

## Multi-Tenancy Model

### Tenant Identification

Tenants (weddings) are identified via:

1. **Subdomain:** `smithwedding.platform.com` - Primary method
2. **Custom domain:** `smithwedding.com` - Maps to tenant via domain lookup table
3. **Path prefix:** `platform.com/w/smithwedding` - Fallback/mobile deep linking

```
Request Flow:
1. Request arrives at edge
2. Middleware extracts hostname
3. Lookup tenant_id from hostname (cache-first)
4. Inject tenant context into request
5. All DB queries scoped to tenant_id
```

### Database Isolation Strategy

**Recommended: Shared database with tenant_id columns (Row-Level Security)**

Rationale:
- Wedding sites are ephemeral (6-18 months active)
- Data volume per tenant is modest (hundreds of guests, not millions)
- No regulatory compliance requiring physical isolation
- Schema migrations apply once, not per-tenant
- Cost-efficient: One database serves thousands of tenants

```sql
-- Every tenant-scoped table includes:
tenant_id UUID NOT NULL REFERENCES tenants(id),

-- Queries ALWAYS include tenant context:
SELECT * FROM guests WHERE tenant_id = $1 AND ...

-- Optional: PostgreSQL RLS for defense-in-depth
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON guests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Domain Routing Table

```sql
CREATE TABLE tenant_domains (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  domain VARCHAR(255) NOT NULL UNIQUE,  -- 'smithwedding' for subdomain, full domain for custom
  domain_type VARCHAR(20) NOT NULL,      -- 'subdomain' | 'custom'
  ssl_status VARCHAR(20) DEFAULT 'pending',
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_domains_lookup ON tenant_domains(domain);
```

---

## Data Model

### Core Entities

```
TENANTS (Weddings)
  - id, created_at, status
  - partner1_name, partner2_name
  - wedding_date, venue
  - theme_id, custom_styles (JSON)
  - settings (JSON: privacy, features enabled)

USERS
  - id, email, password_hash, role
  - tenant_id (NULL for platform admins)
  - OAuth provider fields

GUESTS
  - id, tenant_id
  - name, email, phone
  - household_id (for grouping families)
  - access_code (unique per tenant)
  - dietary_restrictions, notes

RSVPS
  - id, tenant_id, guest_id
  - event_id (ceremony, reception, etc.)
  - response (yes/no/maybe), responded_at
  - plus_ones, meal_choice
  - custom_fields (JSON)

EVENTS
  - id, tenant_id
  - name, date_time, location
  - description, dress_code

REGISTRY_ITEMS
  - id, tenant_id
  - title, description, price
  - external_url, image_url
  - type (link | cash_fund | internal)
  - payment_qr_data (JSON)
  - purchased, purchased_by

PHOTOS
  - id, tenant_id
  - uploaded_by_guest_id (NULL if couple)
  - storage_key, cdn_url
  - album_id, caption
  - moderation_status

PAGES (Website content)
  - id, tenant_id
  - slug, title, content (JSON/MDX)
  - is_published, order
```

### Entity Relationships

```
Tenant (1) ----< (N) Users (couples managing the site)
Tenant (1) ----< (N) Guests
Tenant (1) ----< (N) Events
Tenant (1) ----< (N) Registry Items
Tenant (1) ----< (N) Photos
Tenant (1) ----< (N) Pages

Guest (1) ----< (N) RSVPs
Event (1) ----< (N) RSVPs
Household (1) ----< (N) Guests
```

---

## Component Boundaries

### API Contract Boundaries

```
/api/admin/*          Platform admin only (super-user JWT)
  - /tenants          CRUD tenants
  - /analytics        Platform-wide metrics

/api/couple/*         Authenticated couple (tenant-scoped JWT)
  - /guests           CRUD guests
  - /events           CRUD events
  - /rsvps            View RSVPs
  - /registry         CRUD registry items
  - /photos           Upload/manage photos
  - /website          Theme, pages, settings
  - /domains          Custom domain management

/api/guest/*          Guest access (code-based session)
  - /rsvp             Submit RSVP (own guest record)
  - /registry         View registry
  - /photos           View + upload to shared album
  - /info             View event details

/api/public/*         No auth required
  - /validate-code    Check guest access code
  - /website/:tenant  Public website data (if public)
```

### Service Boundaries (if separating later)

For initial build, a monolith is recommended. Natural seams for future extraction:

| Candidate Service | Trigger to Extract | Notes |
|------------------|-------------------|-------|
| Media Service | Photo volume > storage can handle | Upload, process, serve |
| Notification Service | Email volume > inline can handle | Queue-based, async |
| Domain Service | Custom domain complexity grows | SSL provisioning, DNS verification |

---

## Data Flow

### Guest RSVP Flow

```
1. Guest visits smithwedding.platform.com
2. Middleware extracts tenant from subdomain
3. Guest enters access code "SMITH2026"
4. System validates code against tenant's codes
   - If unique per-guest: identify guest record
   - If general code: create anonymous session
5. Guest submits RSVP form
6. API validates, stores RSVP with tenant_id + guest_id
7. Optional: Send confirmation email
8. Couple sees updated RSVP dashboard
```

### Photo Upload Flow

```
1. Couple/Guest initiates upload from dashboard
2. Frontend requests pre-signed upload URL
3. Backend generates signed URL scoped to tenant's storage prefix
4. Client uploads directly to object storage (bypasses app server)
5. Storage triggers webhook or client notifies completion
6. Backend creates photo record, queues processing job
7. Processing service generates thumbnails, optimizes
8. CDN serves images with tenant-prefixed paths
```

### Custom Domain Setup Flow

```
1. Couple enters custom domain in settings
2. System generates DNS instructions (CNAME to platform)
3. Couple configures DNS at their registrar
4. Platform periodically checks DNS propagation
5. Once verified, trigger ACME certificate provisioning
6. Update domain routing table with verified status
7. Requests to custom domain now resolve to tenant
```

---

## Suggested Build Order

Based on dependencies, build in this order:

### Phase 1: Foundation (Must build first)

1. **Database schema + tenant model**
   - Tenant table, domain routing table
   - User table with role support
   - Required for everything else

2. **Authentication system**
   - Couple signup/login
   - Guest access code validation
   - JWT/session infrastructure

3. **Middleware for tenant routing**
   - Subdomain extraction
   - Tenant context injection
   - Required before any tenant-scoped features

### Phase 2: Core Wedding Features

4. **Couple dashboard (basic)**
   - Wedding details form
   - Settings management
   - Builds on auth + tenant routing

5. **Guest management**
   - CRUD guests
   - Household grouping
   - Access code generation
   - Required for RSVP

6. **Event management**
   - CRUD events (ceremony, reception, etc.)
   - Required for RSVP

7. **RSVP system**
   - Guest-facing RSVP form
   - Couple-facing RSVP dashboard
   - Depends on: guests, events, guest auth

### Phase 3: Secondary Features

8. **Website builder/themes**
   - Theme selection
   - Content page editing
   - Public website rendering
   - Can build in parallel with RSVP

9. **Registry**
   - External link registry
   - Cash fund with QR codes
   - Relatively independent

10. **Photo sharing**
    - Upload pipeline
    - Gallery viewing
    - Guest uploads (optional)
    - Can defer processing optimizations

### Phase 4: Polish + Scale

11. **Custom domains**
    - Domain verification
    - SSL provisioning
    - Edge routing updates
    - Complex, defer until core works

12. **Notifications**
    - Email confirmations
    - RSVP alerts
    - Can add incrementally

13. **Analytics**
    - View counts, engagement
    - Platform-wide metrics
    - Nice-to-have

### Dependency Graph

```
[Database Schema]
       |
       v
[Auth System] -----> [Tenant Middleware]
       |                     |
       v                     v
[Couple Dashboard] <-- [Tenant Context]
       |
       +---> [Guest Mgmt] ---> [RSVP System]
       |          |
       +---> [Events] --------^
       |
       +---> [Website Builder] (parallel)
       |
       +---> [Registry] (parallel)
       |
       +---> [Photos] (parallel)
       |
       v
[Custom Domains] (defer)
```

---

## Security Considerations

### Tenant Isolation Checklist

- [ ] Every DB query includes tenant_id filter
- [ ] API routes validate JWT tenant matches request tenant
- [ ] File storage paths prefixed with tenant_id
- [ ] Guest codes are unique within tenant, not globally
- [ ] Custom domain verification prevents domain hijacking

### Guest Access Security

- Access codes should be:
  - Unique per tenant (not globally)
  - Not easily guessable (alphanumeric, 6-10 chars)
  - Optionally time-limited (expire after wedding)

- Guest sessions should:
  - Be short-lived (24-48 hours)
  - Be scoped to specific tenant
  - Not grant access to couple dashboard

### Media Security

- Pre-signed URLs expire quickly (15 min)
- Upload paths validate tenant prefix
- Consider watermarking for photo downloads
- Moderate user-uploaded content if allowing guest uploads

---

## Scalability Notes

| Concern | At 100 weddings | At 10K weddings | At 100K weddings |
|---------|-----------------|-----------------|------------------|
| Database | Single Postgres | Read replicas | Shard by tenant or archive inactive |
| Media | Single S3 bucket | Same (S3 scales) | Lifecycle policies for old weddings |
| Traffic | Single origin | CDN for static | Edge rendering, regional origins |
| SSL | Wildcard cert | Same | Same + ACME automation for custom domains |

**Key insight:** Wedding websites are ephemeral. Most traffic is 2-4 months before the wedding, then drops to near-zero. Inactive tenant data can be archived aggressively (6-12 months post-wedding).

---

## Technology Recommendations

Based on the architecture patterns and project requirements:

| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| Framework | Next.js (App Router) | Native multi-tenant support, middleware, SSR/SSG hybrid |
| Database | PostgreSQL | RLS support, JSON columns, full-text search |
| ORM | Prisma or Drizzle | Type-safe, tenant-scoping middleware patterns |
| Auth | NextAuth.js or custom JWT | Flexible, supports multiple user types |
| Storage | Cloudflare R2 or S3 | Egress-free (R2) or ubiquitous (S3) |
| Image CDN | Cloudflare Images or Cloudinary | On-the-fly transforms |
| Hosting | Vercel | Native Next.js support, edge middleware |
| Email | Resend or SendGrid | Developer-friendly APIs |

---

## Sources

### Multi-Tenant Architecture
- [WorkOS Developer Guide to Multi-Tenant Architecture](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [Microsoft Azure Multi-Tenant Solution Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/saas-multitenant-solution-architecture/)
- [AWS Multi-Tenant SaaS Architecture Blog](https://aws.amazon.com/blogs/architecture/lets-architect-building-multi-tenant-saas-systems/)
- [Clerk: How to Design Multi-Tenant SaaS Architecture](https://clerk.com/blog/how-to-design-multitenant-saas-architecture)

### Database Patterns
- [Bytebase: Multi-Tenant Database Architecture Patterns](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/)
- [Microsoft Azure SQL Multi-Tenant Patterns](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns?view=azuresql)
- [Neon: Multi-tenancy in Postgres](https://neon.com/blog/multi-tenancy-and-database-per-user-design-in-postgres)

### Next.js Multi-Tenant
- [Next.js Official Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant)
- [Vercel: Build Multi-Tenant App with Next.js](https://vercel.com/guides/nextjs-multi-tenant-application)
- [Vercel Platforms Starter Kit (GitHub)](https://github.com/vercel/platforms)

### Custom Domains
- [AWS Tenant Routing Strategies](https://aws.amazon.com/blogs/networking-and-content-delivery/tenant-routing-strategies-for-saas-applications-on-aws/)
- [Wildcard TLS for Multi-Tenant Systems](https://www.skeptrune.com/posts/wildcard-tls-for-multi-tenant-systems/)
- [AWS Amplify Wildcard Subdomains](https://aws.amazon.com/blogs/mobile/wildcard-subdomains-for-multi-tenant-apps-on-aws-amplify-hosting/)

### Media & Storage
- [Cloudinary: Image and Video Management](https://cloudinary.com/)
- [DigitalOcean Spaces Image Hosting](https://www.digitalocean.com/solutions/image-hosting)

### Wedding Platforms (Feature Reference)
- [Zola Wedding Platform](https://www.zola.com)
- [Joy Wedding Website Builder](https://withjoy.com/wedding-website/)
- [FatBit: Wedding Website Builder Business Model](https://www.fatbit.com/fab/makes-wedding-website-builder-platform-good-business-proposition/)

### Authentication Patterns
- [GeeksforGeeks: Designing Authentication Systems](https://www.geeksforgeeks.org/system-design/designing-authentication-system-system-design/)
- [Vertabelo: User Authentication Module Best Practices](https://vertabelo.com/blog/user-authentication-module/)
