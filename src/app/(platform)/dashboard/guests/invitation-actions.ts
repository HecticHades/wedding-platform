"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/email/resend";
import { InvitationEmail } from "@/components/emails/InvitationEmail";
import { getTenantUrl } from "@/lib/url-utils";

type ActionResult =
  | { success: true; sent: number; skipped: number }
  | { success: false; error: string };

/**
 * Send invitation emails to selected guests for a specific event.
 * Only sends to guests who have an email and haven't been sent an invitation for this event.
 */
export async function sendEventInvitations(
  eventId: string,
  guestIds: string[],
  options?: { resendToAll?: boolean }
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId) {
    return { success: false, error: "Event ID is required" };
  }

  if (!guestIds || guestIds.length === 0) {
    return { success: false, error: "No guests selected" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get wedding and tenant info for email content
      const wedding = await prisma.wedding.findFirst({
        include: {
          tenant: {
            select: { subdomain: true },
          },
        },
      });

      if (!wedding || !wedding.tenant) {
        return { success: false as const, error: "Wedding not found" };
      }

      // Get event info
      const event = await prisma.event.findFirst({
        where: { id: eventId },
      });

      if (!event) {
        return { success: false as const, error: "Event not found" };
      }

      // Get event guests with guest details
      const eventGuests = await prisma.eventGuest.findMany({
        where: {
          eventId,
          guestId: { in: guestIds },
        },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Filter to guests with emails and optionally those not yet sent
      const guestsToEmail = eventGuests.filter((eg) => {
        if (!eg.guest.email) return false;
        if (options?.resendToAll) return true;
        return !eg.invitationSentAt;
      });

      if (guestsToEmail.length === 0) {
        return {
          success: true as const,
          sent: 0,
          skipped: guestIds.length,
        };
      }

      // Prepare email data
      const coupleNames = `${wedding.partner1Name} & ${wedding.partner2Name}`;
      const rsvpUrl = getTenantUrl(wedding.tenant.subdomain, "/rsvp");
      const eventDate = event.dateTime
        ? new Date(event.dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;

      // Send emails in batches
      const sentIds: string[] = [];

      for (const eventGuest of guestsToEmail) {
        try {
          await resend.emails.send({
            from: "Wedding Invitation <invitations@resend.dev>",
            to: eventGuest.guest.email!,
            subject: `You're invited to ${coupleNames}'s ${event.name}`,
            react: InvitationEmail({
              guestName: eventGuest.guest.name,
              coupleNames,
              eventName: event.name,
              eventDate,
              eventLocation: event.location || event.address || null,
              rsvpUrl,
            }),
          });
          sentIds.push(eventGuest.id);
        } catch (emailError) {
          console.error(
            `Failed to send invitation to ${eventGuest.guest.email}:`,
            emailError
          );
        }
      }

      // Update invitationSentAt for successfully sent emails
      if (sentIds.length > 0) {
        await prisma.eventGuest.updateMany({
          where: {
            id: { in: sentIds },
          },
          data: {
            invitationSentAt: new Date(),
          },
        });
      }

      const skipped = guestIds.length - sentIds.length;

      return {
        success: true as const,
        sent: sentIds.length,
        skipped,
      };
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/dashboard/events/${eventId}/guests`);
    return result;
  } catch (error) {
    console.error("Failed to send invitations:", error);
    return { success: false, error: "Failed to send invitations" };
  }
}

/**
 * Get invitation status for guests in an event
 */
export async function getEventInvitationStatus(
  eventId: string
): Promise<{ guestId: string; email: string | null; sentAt: Date | null }[]> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return [];
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      const eventGuests = await prisma.eventGuest.findMany({
        where: { eventId },
        include: {
          guest: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      return eventGuests.map((eg) => ({
        guestId: eg.guest.id,
        email: eg.guest.email,
        sentAt: eg.invitationSentAt,
      }));
    });

    return result;
  } catch (error) {
    console.error("Failed to get invitation status:", error);
    return [];
  }
}
