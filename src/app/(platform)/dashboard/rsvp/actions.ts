"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

// Validation schema for RSVP code
const rsvpCodeSchema = z
  .string()
  .min(4, "RSVP code must be at least 4 characters")
  .max(20, "RSVP code must be at most 20 characters")
  .regex(/^[a-zA-Z0-9]+$/, "RSVP code must be alphanumeric");

/**
 * Set or update the RSVP code for the wedding
 */
export async function setRsvpCode(code: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate code
  const parsed = rsvpCodeSchema.safeParse(code);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid code" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Check if code is already in use by another wedding
      const existingWedding = await prisma.wedding.findUnique({
        where: { rsvpCode: parsed.data },
        select: { tenantId: true },
      });

      if (existingWedding && existingWedding.tenantId !== session.user.tenantId) {
        return { success: false as const, error: "This RSVP code is already in use" };
      }

      // Update wedding rsvpCode
      await prisma.wedding.updateMany({
        data: { rsvpCode: parsed.data },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/rsvp");
    return result;
  } catch (error) {
    console.error("Failed to set RSVP code:", error);
    return { success: false, error: "Failed to set RSVP code" };
  }
}

/**
 * Guest with RSVP data for the dashboard list
 */
export interface RsvpGuest {
  id: string;
  name: string;
  partyName: string | null;
  email: string | null;
  phone: string | null;
  eventResponses: Array<{
    eventId: string;
    eventName: string;
    rsvpStatus: "PENDING" | "ATTENDING" | "DECLINED" | "MAYBE" | null;
    plusOneCount: number | null;
    mealChoice: string | null;
    dietaryNotes: string | null;
  }>;
}

/**
 * Get list of all guests with their RSVP responses
 */
export async function getRsvpGuestList(tenantId: string): Promise<RsvpGuest[]> {
  return withTenantContext(tenantId, async () => {
    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      include: {
        eventInvitations: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      partyName: guest.partyName,
      email: guest.email,
      phone: guest.phone,
      eventResponses: guest.eventInvitations.map((inv) => ({
        eventId: inv.event.id,
        eventName: inv.event.name,
        rsvpStatus: inv.rsvpStatus,
        plusOneCount: inv.plusOneCount,
        mealChoice: inv.mealChoice,
        dietaryNotes: inv.dietaryNotes,
      })),
    }));
  });
}
