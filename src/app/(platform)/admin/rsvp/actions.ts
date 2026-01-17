"use server"

import { prisma } from "@/lib/db/prisma"

export interface AdminWeddingRsvpSummary {
  weddingId: string
  subdomain: string
  coupleNames: string
  weddingDate: Date | null
  hasRsvpCode: boolean
  totalGuests: number
  totalInvitations: number
  responded: number
  attending: number
  declined: number
  responseRate: number
}

export async function getAdminRsvpOverview(): Promise<AdminWeddingRsvpSummary[]> {
  // IMPORTANT: Do NOT use withTenantContext - admin sees all weddings
  const weddings = await prisma.wedding.findMany({
    select: {
      id: true,
      partner1Name: true,
      partner2Name: true,
      weddingDate: true,
      rsvpCode: true,
      tenant: {
        select: { subdomain: true },
      },
      _count: {
        select: { guests: true },
      },
      events: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { guestInvitations: true },
          },
          guestInvitations: {
            select: { rsvpStatus: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Transform to summary format
  const summaries: AdminWeddingRsvpSummary[] = weddings.map((wedding) => {
    // Aggregate RSVP stats across all events
    let totalInvitations = 0
    let responded = 0
    let attending = 0
    let declined = 0

    for (const event of wedding.events) {
      totalInvitations += event._count.guestInvitations

      for (const invitation of event.guestInvitations) {
        if (invitation.rsvpStatus !== null) {
          responded++
          if (invitation.rsvpStatus === "ATTENDING") {
            attending++
          } else if (invitation.rsvpStatus === "DECLINED") {
            declined++
          }
        }
      }
    }

    const responseRate =
      totalInvitations > 0 ? (responded / totalInvitations) * 100 : 0

    return {
      weddingId: wedding.id,
      subdomain: wedding.tenant.subdomain,
      coupleNames: `${wedding.partner1Name} & ${wedding.partner2Name}`,
      weddingDate: wedding.weddingDate,
      hasRsvpCode: wedding.rsvpCode !== null,
      totalGuests: wedding._count.guests,
      totalInvitations,
      responded,
      attending,
      declined,
      responseRate,
    }
  })

  // Sort by wedding date (upcoming first), then by response rate
  return summaries.sort((a, b) => {
    // If both have dates, sort upcoming first
    if (a.weddingDate && b.weddingDate) {
      return a.weddingDate.getTime() - b.weddingDate.getTime()
    }
    // Weddings with dates come before those without
    if (a.weddingDate && !b.weddingDate) return -1
    if (!a.weddingDate && b.weddingDate) return 1
    // If neither has date, sort by response rate descending
    return b.responseRate - a.responseRate
  })
}
