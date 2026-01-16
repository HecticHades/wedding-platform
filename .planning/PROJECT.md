# Wedding Website Platform

## What This Is

A multi-tenant SaaS platform where couples can have their own customizable wedding website. Each couple's site includes RSVP management, a gift registry with payment QR codes, and post-wedding photo sharing. Built as a commercial product designed to scale to many couples.

## Core Value

Couples can easily share their wedding details with guests and manage RSVPs, gifts, and photos in one place — with minimal friction for both couples and guests.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Admin can create new wedding sites for couples
- [ ] Admin can modify any couple's site
- [ ] Couples can customize visual theme (colors, fonts)
- [ ] Couples can add/remove/edit content sections (Our Story, Venue, etc.)
- [ ] Couples can configure custom domain
- [ ] Couples can set their wedding RSVP code
- [ ] Couples can define their gift list with prices
- [ ] Couples can configure payment method (bank transfer, PayPal, Twint)
- [ ] Guests can access site using wedding code
- [ ] Guests can confirm attendance
- [ ] Guests can indicate +1
- [ ] Guests can specify food preferences
- [ ] Guests can browse gift registry
- [ ] Guests can select a gift and receive payment QR code
- [ ] Couples can upload wedding photos after the event
- [ ] Guests can view shared wedding photos

### Out of Scope

- Mobile app — web-first approach
- Real-time chat between guests — adds complexity, not core to wedding site value
- Video hosting — storage/bandwidth costs, couples can link to external services
- Guest-to-guest communication — privacy concerns, keep it couple-to-guest

## Context

- **Multi-tenant architecture**: Each couple gets their own isolated site with unique URL/domain
- **Hybrid onboarding**: Admin creates initial sites, couples customize, admin retains full access
- **Payment flexibility**: Different couples may want different payment providers based on region (Swiss market uses Twint, others prefer PayPal or bank transfer)
- **RSVP model**: One shared code per wedding (not per-guest), guests self-register their details
- **Scalability priority**: Architecture should support many couples without per-tenant infrastructure overhead

## Constraints

- **Multi-tenant**: Single deployment serves all couples — no per-couple infrastructure
- **Payment QR**: Must support generating QR codes for bank transfer details and redirect to PayPal/Twint

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| One RSVP code per wedding | Simplicity over per-guest tracking — reduces couple workload | — Pending |
| Hybrid onboarding model | Allows personalized service while couples retain control | — Pending |
| Multiple payment methods per couple | Regional flexibility (Twint for Swiss, PayPal elsewhere, bank transfer universal) | — Pending |

---
*Last updated: 2025-01-16 after initialization*
