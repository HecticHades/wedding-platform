"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { resend } from "@/lib/email/resend";
import { RsvpReminderEmail } from "@/components/emails/RsvpReminderEmail";
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

/**
 * Result type for reminder sending action
 */
type ReminderResult =
  | { success: true; sent: number }
  | { success: false; error: string };

/**
 * Send RSVP reminder emails to guests who haven't responded
 * Only sends to guests with email addresses who have at least one pending event response
 */
export async function sendRsvpReminders(): Promise<ReminderResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const tenantId = session.user.tenantId;

  try {
    const result = await withTenantContext(tenantId, async () => {
      // Fetch wedding with tenant info
      const wedding = await prisma.wedding.findFirst({
        select: {
          partner1Name: true,
          partner2Name: true,
          weddingDate: true,
          tenant: {
            select: { subdomain: true },
          },
        },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      // Fetch guests who:
      // 1. Have an email address
      // 2. Have at least one EventGuest with rsvpStatus = null
      const guests = await prisma.guest.findMany({
        where: {
          email: { not: null },
          eventInvitations: {
            some: {
              rsvpStatus: null,
            },
          },
        },
        include: {
          eventInvitations: {
            where: {
              rsvpStatus: null,
            },
            include: {
              event: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // No pending guests to remind
      if (guests.length === 0) {
        return { success: true as const, sent: 0 };
      }

      const coupleNames = `${wedding.partner1Name} & ${wedding.partner2Name}`;
      const weddingDate = wedding.weddingDate
        ? wedding.weddingDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;

      // Build RSVP URL - use the tenant subdomain
      // In production, replace with actual domain
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com";
      const rsvpBaseUrl = baseUrl.includes("localhost")
        ? `http://${wedding.tenant.subdomain}.localhost:3000`
        : `https://${wedding.tenant.subdomain}.${baseUrl.replace(/^https?:\/\//, "")}`;

      // Build email list
      const emails = guests.map((guest) => ({
        from: "Wedding Platform <noreply@resend.dev>",
        to: guest.email!,
        subject: `RSVP Reminder: ${coupleNames}'s Wedding`,
        react: RsvpReminderEmail({
          guestName: guest.name,
          coupleNames,
          weddingDate,
          rsvpUrl: `${rsvpBaseUrl}/rsvp`,
          eventNames: guest.eventInvitations.map((inv) => inv.event.name),
        }),
      }));

      // Send emails using Resend batch API
      const { error } = await resend.batch.send(emails);

      if (error) {
        console.error("Resend batch error:", error);
        return { success: false as const, error: "Failed to send reminder emails" };
      }

      return { success: true as const, sent: emails.length };
    });

    return result;
  } catch (error) {
    console.error("Failed to send RSVP reminders:", error);
    return { success: false, error: "Failed to send reminder emails" };
  }
}
