"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for gift data
const giftSchema = z.object({
  name: z.string().min(1, "Gift name is required").max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().positive("Amount must be positive"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type GiftResult =
  | { success: true; giftId: string }
  | { success: false; error: string };

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Create a new gift item for the couple's registry
 */
export async function createGift(formData: FormData): Promise<GiftResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    targetAmount: formData.get("targetAmount") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  };

  // Validate input
  const parsed = giftSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
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
      const maxOrderGift = await prisma.giftItem.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const nextOrder = (maxOrderGift?.order ?? -1) + 1;

      // Create gift item
      const gift = await prisma.giftItem.create({
        data: {
          weddingId: wedding.id,
          name: parsed.data.name,
          description: parsed.data.description || null,
          targetAmount: new Prisma.Decimal(parsed.data.targetAmount),
          imageUrl: parsed.data.imageUrl || null,
          order: nextOrder,
        },
      });

      return { success: true as const, giftId: gift.id };
    });

    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to create gift:", error);
    return { success: false, error: "Failed to create gift" };
  }
}

/**
 * Update an existing gift item
 */
export async function updateGift(
  giftId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!giftId) {
    return { success: false, error: "Gift ID is required" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    targetAmount: formData.get("targetAmount") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  };

  // Validate input
  const parsed = giftSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify gift exists and belongs to this tenant's wedding
      const existingGift = await prisma.giftItem.findFirst({
        where: { id: giftId },
        select: { id: true },
      });

      if (!existingGift) {
        return { success: false as const, error: "Gift not found" };
      }

      // Update gift
      await prisma.giftItem.update({
        where: { id: giftId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          targetAmount: new Prisma.Decimal(parsed.data.targetAmount),
          imageUrl: parsed.data.imageUrl || null,
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry");
    revalidatePath(`/dashboard/registry/${giftId}`);
    return result;
  } catch (error) {
    console.error("Failed to update gift:", error);
    return { success: false, error: "Failed to update gift" };
  }
}

/**
 * Delete a gift item
 */
export async function deleteGift(giftId: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!giftId) {
    return { success: false, error: "Gift ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify gift exists and belongs to this tenant's wedding
      const existingGift = await prisma.giftItem.findFirst({
        where: { id: giftId },
        select: { id: true },
      });

      if (!existingGift) {
        return { success: false as const, error: "Gift not found" };
      }

      // Delete gift
      await prisma.giftItem.delete({
        where: { id: giftId },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to delete gift:", error);
    return { success: false, error: "Failed to delete gift" };
  }
}

/**
 * Reorder gift items
 */
export async function reorderGifts(
  orderedGifts: { id: string; order: number }[]
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

  const parsed = orderSchema.safeParse(orderedGifts);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Update each gift's order
      await Promise.all(
        parsed.data.map((item) =>
          prisma.giftItem.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to reorder gifts:", error);
    return { success: false, error: "Failed to reorder gifts" };
  }
}
