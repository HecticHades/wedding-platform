"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Guest validation schema
const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  partyName: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  partySize: z.coerce.number().int().min(1).default(1),
  allowPlusOne: z
    .string()
    .optional()
    .transform((val) => val === "on" || val === "true"),
});

/**
 * Create a new guest for the couple's wedding
 */
export async function createGuest(formData: FormData) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    partyName: formData.get("partyName"),
    partySize: formData.get("partySize"),
    allowPlusOne: formData.get("allowPlusOne"),
  };

  const parsed = guestSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] ?? "Invalid data";
    return { success: false, error: firstError };
  }

  const data = parsed.data;

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get the wedding for this tenant
      const wedding = await prisma.wedding.findFirst({
        select: { id: true },
      });

      if (!wedding) {
        return { success: false, error: "Wedding not found" };
      }

      // Create the guest
      const guest = await prisma.guest.create({
        data: {
          weddingId: wedding.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          partyName: data.partyName,
          partySize: data.partySize,
          allowPlusOne: data.allowPlusOne,
        },
      });

      return { success: true, guestId: guest.id };
    });

    revalidatePath("/dashboard/guests");
    return result;
  } catch (error) {
    console.error("Error creating guest:", error);
    return { success: false, error: "Failed to create guest" };
  }
}

/**
 * Update an existing guest
 */
export async function updateGuest(guestId: string, formData: FormData) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!guestId) {
    return { success: false, error: "Guest ID is required" };
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    partyName: formData.get("partyName"),
    partySize: formData.get("partySize"),
    allowPlusOne: formData.get("allowPlusOne"),
  };

  const parsed = guestSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] ?? "Invalid data";
    return { success: false, error: firstError };
  }

  const data = parsed.data;

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify guest belongs to tenant's wedding (tenant isolation via Prisma extension)
      const existingGuest = await prisma.guest.findFirst({
        where: { id: guestId },
        select: { id: true },
      });

      if (!existingGuest) {
        return { success: false, error: "Guest not found" };
      }

      // Update the guest
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          partyName: data.partyName,
          partySize: data.partySize,
          allowPlusOne: data.allowPlusOne,
        },
      });

      return { success: true };
    });

    revalidatePath("/dashboard/guests");
    revalidatePath(`/dashboard/guests/${guestId}`);
    return result;
  } catch (error) {
    console.error("Error updating guest:", error);
    return { success: false, error: "Failed to update guest" };
  }
}

/**
 * Delete a guest (cascades to EventGuest records)
 */
export async function deleteGuest(guestId: string) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!guestId) {
    return { success: false, error: "Guest ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify guest belongs to tenant's wedding (tenant isolation via Prisma extension)
      const existingGuest = await prisma.guest.findFirst({
        where: { id: guestId },
        select: { id: true },
      });

      if (!existingGuest) {
        return { success: false, error: "Guest not found" };
      }

      // Delete the guest (EventGuest records cascade via onDelete)
      await prisma.guest.delete({
        where: { id: guestId },
      });

      return { success: true };
    });

    revalidatePath("/dashboard/guests");
    return result;
  } catch (error) {
    console.error("Error deleting guest:", error);
    return { success: false, error: "Failed to delete guest" };
  }
}
