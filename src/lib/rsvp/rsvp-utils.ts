import { prisma, withTenantContext } from "@/lib/db/prisma";

/**
 * Overall RSVP statistics for a wedding
 */
export interface RsvpStats {
  totalInvited: number;      // Total EventGuest records
  totalResponded: number;    // Where rsvpStatus is not null
  attending: number;         // ATTENDING count
  declined: number;          // DECLINED count
  pending: number;           // No response yet
  totalHeadcount: number;    // Attending guests + their plus-ones
}

/**
 * Per-event RSVP statistics with meal tallies
 */
export interface EventRsvpStats {
  eventId: string;
  eventName: string;
  eventDate: Date;
  invited: number;
  attending: number;
  declined: number;
  pending: number;
  headcount: number;  // With plus-ones
  mealCounts: Record<string, number>;  // mealChoice -> count
}

/**
 * Get overall RSVP statistics for a wedding
 */
export async function getRsvpStats(tenantId: string): Promise<RsvpStats> {
  return withTenantContext(tenantId, async () => {
    // Get all EventGuest records for this wedding's events
    const eventGuests = await prisma.eventGuest.findMany({
      select: {
        rsvpStatus: true,
        plusOneCount: true,
      },
    });

    const totalInvited = eventGuests.length;
    const totalResponded = eventGuests.filter((eg) => eg.rsvpStatus !== null).length;
    const attending = eventGuests.filter((eg) => eg.rsvpStatus === "ATTENDING").length;
    const declined = eventGuests.filter((eg) => eg.rsvpStatus === "DECLINED").length;
    const pending = totalInvited - totalResponded;

    // Calculate headcount: each attending guest + their plus-ones
    const totalHeadcount = eventGuests
      .filter((eg) => eg.rsvpStatus === "ATTENDING")
      .reduce((sum, eg) => sum + 1 + (eg.plusOneCount ?? 0), 0);

    return {
      totalInvited,
      totalResponded,
      attending,
      declined,
      pending,
      totalHeadcount,
    };
  });
}

/**
 * Get per-event RSVP statistics with meal tallies
 */
export async function getRsvpStatsPerEvent(tenantId: string): Promise<EventRsvpStats[]> {
  return withTenantContext(tenantId, async () => {
    // Get all events with their guest invitations
    const events = await prisma.event.findMany({
      orderBy: { dateTime: "asc" },
      include: {
        guestInvitations: {
          select: {
            rsvpStatus: true,
            plusOneCount: true,
            mealChoice: true,
          },
        },
      },
    });

    return events.map((event) => {
      const invited = event.guestInvitations.length;
      const attending = event.guestInvitations.filter(
        (eg) => eg.rsvpStatus === "ATTENDING"
      ).length;
      const declined = event.guestInvitations.filter(
        (eg) => eg.rsvpStatus === "DECLINED"
      ).length;
      const pending = event.guestInvitations.filter(
        (eg) => eg.rsvpStatus === null
      ).length;

      // Calculate headcount: attending guests + their plus-ones
      const headcount = event.guestInvitations
        .filter((eg) => eg.rsvpStatus === "ATTENDING")
        .reduce((sum, eg) => sum + 1 + (eg.plusOneCount ?? 0), 0);

      // Tally meal choices
      const mealCounts: Record<string, number> = {};
      event.guestInvitations
        .filter((eg) => eg.rsvpStatus === "ATTENDING" && eg.mealChoice)
        .forEach((eg) => {
          const choice = eg.mealChoice!;
          mealCounts[choice] = (mealCounts[choice] ?? 0) + 1;
        });

      return {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.dateTime,
        invited,
        attending,
        declined,
        pending,
        headcount,
        mealCounts,
      };
    });
  });
}
