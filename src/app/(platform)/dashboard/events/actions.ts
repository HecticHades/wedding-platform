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
