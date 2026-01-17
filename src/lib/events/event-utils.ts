import { prisma } from "@/lib/db/prisma";

/**
 * Event data returned from getVisibleEvents
 */
export interface VisibleEvent {
  id: string;
  name: string;
  description: string | null;
  dateTime: Date;
  endTime: Date | null;
  location: string | null;
  address: string | null;
  dressCode: string | null;
  isPublic: boolean;
  order: number;
}

interface GetVisibleEventsOptions {
  weddingId: string;
  guestId?: string;
}

/**
 * Get events visible to a specific guest or anonymous visitor.
 *
 * For anonymous visitors (no guestId): returns only public events.
 * For identified guests: returns public events + events they're invited to.
 *
 * Used by both dashboard (showing invitation status) and public site (filtering visible events).
 */
export async function getVisibleEvents({
  weddingId,
  guestId,
}: GetVisibleEventsOptions): Promise<VisibleEvent[]> {
  // Fetch all events for the wedding
  const events = await prisma.event.findMany({
    where: { weddingId },
    orderBy: [{ dateTime: "asc" }, { order: "asc" }],
    include: guestId
      ? {
          guestInvitations: {
            where: { guestId },
            select: { id: true },
          },
        }
      : undefined,
  });

  // Filter based on visibility rules
  const visibleEvents = events.filter((event) => {
    // Public events are always visible
    if (event.isPublic) {
      return true;
    }

    // For private events, guest must have an invitation
    if (guestId && "guestInvitations" in event) {
      const invitations = event.guestInvitations as { id: string }[];
      return invitations.length > 0;
    }

    // Anonymous visitors don't see private events
    return false;
  });

  // Return events without the guestInvitations field
  return visibleEvents.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    dateTime: event.dateTime,
    endTime: event.endTime,
    location: event.location,
    address: event.address,
    dressCode: event.dressCode,
    isPublic: event.isPublic,
    order: event.order,
  }));
}
