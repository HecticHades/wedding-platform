"use server";

import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { RsvpStatus } from "@prisma/client";

/**
 * Get guest with all their event invitations
 */
export async function getGuestWithEvents(guestId: string) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        wedding: {
          include: {
            tenant: {
              select: { subdomain: true },
            },
          },
        },
        eventInvitations: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                description: true,
                dateTime: true,
                endTime: true,
                location: true,
                address: true,
                dressCode: true,
                mealOptions: true,
              },
            },
          },
          orderBy: {
            event: {
              dateTime: "asc",
            },
          },
        },
      },
    });

    if (!guest) {
      return null;
    }

    const coupleNames = `${guest.wedding.partner1Name} & ${guest.wedding.partner2Name}`;

    return {
      id: guest.id,
      name: guest.name,
      allowPlusOne: guest.allowPlusOne,
      wedding: {
        id: guest.wedding.id,
        coupleNames,
        weddingDate: guest.wedding.weddingDate,
        subdomain: guest.wedding.tenant.subdomain,
      },
      events: guest.eventInvitations.map((inv) => ({
        id: inv.event.id,
        name: inv.event.name,
        description: inv.event.description,
        dateTime: inv.event.dateTime,
        endTime: inv.event.endTime,
        location: inv.event.location,
        address: inv.event.address,
        dressCode: inv.event.dressCode,
        mealOptions: inv.event.mealOptions as PrismaJson.MealOption[],
        currentRsvp: {
          rsvpStatus: inv.rsvpStatus,
          rsvpAt: inv.rsvpAt,
          plusOneCount: inv.plusOneCount,
          plusOneName: inv.plusOneName,
          mealChoice: inv.mealChoice,
          dietaryNotes: inv.dietaryNotes,
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching guest with events:", error);
    return null;
  }
}

// Zod schema for RSVP submission
const rsvpSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  rsvpStatus: z.enum(["ATTENDING", "DECLINED"]),
  plusOneCount: z.coerce.number().int().min(0).max(10).optional(),
  plusOneName: z
    .string()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  mealChoice: z
    .string()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  dietaryNotes: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

/**
 * Submit RSVP for a specific event
 */
export async function submitRsvp(
  guestId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = rsvpSchema.safeParse({
      eventId: formData.get("eventId"),
      rsvpStatus: formData.get("rsvpStatus"),
      plusOneCount: formData.get("plusOneCount"),
      plusOneName: formData.get("plusOneName"),
      mealChoice: formData.get("mealChoice"),
      dietaryNotes: formData.get("dietaryNotes"),
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid RSVP data" };
    }

    const data = parsed.data;

    // Security: Verify the guest owns this EventGuest record
    const eventGuest = await prisma.eventGuest.findUnique({
      where: {
        eventId_guestId: {
          eventId: data.eventId,
          guestId,
        },
      },
    });

    if (!eventGuest) {
      return { success: false, error: "Event invitation not found" };
    }

    // Update EventGuest record with RSVP data
    await prisma.eventGuest.update({
      where: {
        eventId_guestId: {
          eventId: data.eventId,
          guestId,
        },
      },
      data: {
        rsvpStatus: data.rsvpStatus as RsvpStatus,
        rsvpAt: new Date(),
        plusOneCount: data.plusOneCount ?? null,
        plusOneName: data.plusOneName,
        mealChoice: data.mealChoice,
        dietaryNotes: data.dietaryNotes,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}
