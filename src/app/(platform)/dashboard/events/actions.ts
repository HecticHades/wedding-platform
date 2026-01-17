"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for event data
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  endTime: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  dressCode: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type EventResult =
  | { success: true; eventId: string }
  | { success: false; error: string };

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Create a new event for the couple's wedding
 */
export async function createEvent(formData: FormData): Promise<EventResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    dateTime: formData.get("dateTime") as string,
    endTime: formData.get("endTime") as string || undefined,
    location: formData.get("location") as string || undefined,
    address: formData.get("address") as string || undefined,
    dressCode: formData.get("dressCode") as string || undefined,
    isPublic: formData.get("isPublic") === "true",
  };

  // Validate input
  const parsed = eventSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get wedding ID
      const wedding = await prisma.wedding.findFirst({
        select: { id: true },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      // Calculate order as max(existing orders) + 1
      const maxOrderEvent = await prisma.event.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const nextOrder = (maxOrderEvent?.order ?? -1) + 1;

      // Create event
      const event = await prisma.event.create({
        data: {
          weddingId: wedding.id,
          name: parsed.data.name,
          description: parsed.data.description || null,
          dateTime: new Date(parsed.data.dateTime),
          endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
          location: parsed.data.location || null,
          address: parsed.data.address || null,
          dressCode: parsed.data.dressCode || null,
          isPublic: parsed.data.isPublic,
          order: nextOrder,
        },
      });

      return { success: true as const, eventId: event.id };
    });

    revalidatePath("/dashboard/events");
    return result;
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId) {
    return { success: false, error: "Event ID is required" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    dateTime: formData.get("dateTime") as string,
    endTime: formData.get("endTime") as string || undefined,
    location: formData.get("location") as string || undefined,
    address: formData.get("address") as string || undefined,
    dressCode: formData.get("dressCode") as string || undefined,
    isPublic: formData.get("isPublic") === "true",
  };

  // Validate input
  const parsed = eventSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists and belongs to this tenant's wedding
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Update event
      await prisma.event.update({
        where: { id: eventId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          dateTime: new Date(parsed.data.dateTime),
          endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
          location: parsed.data.location || null,
          address: parsed.data.address || null,
          dressCode: parsed.data.dressCode || null,
          isPublic: parsed.data.isPublic,
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${eventId}`);
    return result;
  } catch (error) {
    console.error("Failed to update event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId) {
    return { success: false, error: "Event ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists and belongs to this tenant's wedding
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Delete event (cascades to EventGuest)
      await prisma.event.delete({
        where: { id: eventId },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/events");
    return result;
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

/**
 * Reorder events
 */
export async function reorderEvents(
  orderedEvents: { id: string; order: number }[]
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate input
  const orderSchema = z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
    })
  );

  const parsed = orderSchema.safeParse(orderedEvents);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Update each event's order
      await Promise.all(
        parsed.data.map((item) =>
          prisma.event.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      return { success: true as const };
    });

    revalidatePath("/dashboard/events");
    return result;
  } catch (error) {
    console.error("Failed to reorder events:", error);
    return { success: false, error: "Failed to reorder events" };
  }
}

/**
 * Update all guest invitations for an event (bulk replace)
 * Atomically removes all existing invitations and creates new ones
 */
export async function updateEventInvitations(
  eventId: string,
  guestIds: string[]
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate input
  if (!eventId || typeof eventId !== "string") {
    return { success: false, error: "Event ID is required" };
  }

  const guestIdsSchema = z.array(z.string().min(1));
  const parsed = guestIdsSchema.safeParse(guestIds);
  if (!parsed.success) {
    return { success: false, error: "Invalid guest IDs" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists and belongs to this tenant's wedding
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Use transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Delete all existing invitations for this event
        await tx.eventGuest.deleteMany({
          where: { eventId },
        });

        // Create new invitations for each guest
        if (parsed.data.length > 0) {
          await tx.eventGuest.createMany({
            data: parsed.data.map((guestId) => ({
              eventId,
              guestId,
            })),
          });
        }
      });

      return { success: true as const };
    });

    revalidatePath(`/dashboard/events/${eventId}/guests`);
    revalidatePath("/dashboard/events");
    return result;
  } catch (error) {
    console.error("Failed to update event invitations:", error);
    return { success: false, error: "Failed to update invitations" };
  }
}

/**
 * Invite a single guest to an event (upsert - no-op if already invited)
 */
export async function inviteGuestToEvent(
  eventId: string,
  guestId: string
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId || !guestId) {
    return { success: false, error: "Event ID and Guest ID are required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Upsert invitation
      await prisma.eventGuest.upsert({
        where: {
          eventId_guestId: { eventId, guestId },
        },
        create: { eventId, guestId },
        update: {}, // No update needed, just confirm existence
      });

      return { success: true as const };
    });

    revalidatePath(`/dashboard/events/${eventId}/guests`);
    return result;
  } catch (error) {
    console.error("Failed to invite guest to event:", error);
    return { success: false, error: "Failed to invite guest" };
  }
}

/**
 * Remove a single guest from an event
 */
export async function removeGuestFromEvent(
  eventId: string,
  guestId: string
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId || !guestId) {
    return { success: false, error: "Event ID and Guest ID are required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Delete invitation
      await prisma.eventGuest.deleteMany({
        where: { eventId, guestId },
      });

      return { success: true as const };
    });

    revalidatePath(`/dashboard/events/${eventId}/guests`);
    return result;
  } catch (error) {
    console.error("Failed to remove guest from event:", error);
    return { success: false, error: "Failed to remove guest" };
  }
}

/**
 * Meal option type for event configuration
 */
export interface MealOption {
  id: string;
  name: string;
  description?: string;
}

// Validation schema for meal options
const mealOptionSchema = z.object({
  id: z.string().min(1, "Meal option ID is required"),
  name: z.string().min(1, "Meal option name is required"),
  description: z.string().optional(),
});

const mealOptionsSchema = z.array(mealOptionSchema);

/**
 * Update meal options for an event
 */
export async function updateMealOptions(
  eventId: string,
  mealOptions: MealOption[]
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!eventId) {
    return { success: false, error: "Event ID is required" };
  }

  // Validate input
  const parsed = mealOptionsSchema.safeParse(mealOptions);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid meal options",
    };
  }

  // Check for duplicate IDs
  const ids = parsed.data.map((opt) => opt.id);
  if (new Set(ids).size !== ids.length) {
    return { success: false, error: "Duplicate meal option IDs" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify event exists and belongs to this tenant's wedding
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId },
        select: { id: true },
      });

      if (!existingEvent) {
        return { success: false as const, error: "Event not found" };
      }

      // Update meal options
      await prisma.event.update({
        where: { id: eventId },
        data: {
          mealOptions: parsed.data,
        },
      });

      return { success: true as const };
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/dashboard/events/${eventId}/meal-options`);
    return result;
  } catch (error) {
    console.error("Failed to update meal options:", error);
    return { success: false, error: "Failed to update meal options" };
  }
}
