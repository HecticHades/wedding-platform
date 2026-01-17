"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const externalRegistrySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  url: z.string().url("Must be a valid URL"),
  description: z
    .string()
    .max(200)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type ActionResult =
  | { success: true; registryId?: string }
  | { success: false; error: string };

/**
 * Create a new external registry link
 */
export async function createExternalRegistry(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    url: formData.get("url") as string,
    description: (formData.get("description") as string) || undefined,
  };

  // Validate input
  const parsed = externalRegistrySchema.safeParse(rawData);
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
      const maxOrderRegistry = await prisma.externalRegistry.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const nextOrder = (maxOrderRegistry?.order ?? -1) + 1;

      // Create registry
      const registry = await prisma.externalRegistry.create({
        data: {
          weddingId: wedding.id,
          name: parsed.data.name,
          url: parsed.data.url,
          description: parsed.data.description || null,
          order: nextOrder,
        },
      });

      return { success: true as const, registryId: registry.id };
    });

    revalidatePath("/dashboard/registry/external");
    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to create external registry:", error);
    return { success: false, error: "Failed to create registry" };
  }
}

/**
 * Update an existing external registry link
 */
export async function updateExternalRegistry(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "Registry ID is required" };
  }

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    url: formData.get("url") as string,
    description: (formData.get("description") as string) || undefined,
  };

  // Validate input
  const parsed = externalRegistrySchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify registry exists and belongs to this tenant's wedding
      const existingRegistry = await prisma.externalRegistry.findFirst({
        where: { id },
        select: { id: true },
      });

      if (!existingRegistry) {
        return { success: false as const, error: "Registry not found" };
      }

      // Update registry
      await prisma.externalRegistry.update({
        where: { id },
        data: {
          name: parsed.data.name,
          url: parsed.data.url,
          description: parsed.data.description || null,
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry/external");
    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to update external registry:", error);
    return { success: false, error: "Failed to update registry" };
  }
}

/**
 * Delete an external registry link
 */
export async function deleteExternalRegistry(id: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "Registry ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify registry exists and belongs to this tenant's wedding
      const existingRegistry = await prisma.externalRegistry.findFirst({
        where: { id },
        select: { id: true },
      });

      if (!existingRegistry) {
        return { success: false as const, error: "Registry not found" };
      }

      // Delete registry
      await prisma.externalRegistry.delete({
        where: { id },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry/external");
    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to delete external registry:", error);
    return { success: false, error: "Failed to delete registry" };
  }
}

/**
 * Reorder external registries
 */
export async function reorderExternalRegistries(
  orderedRegistries: { id: string; order: number }[]
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

  const parsed = orderSchema.safeParse(orderedRegistries);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Update each registry's order
      await Promise.all(
        parsed.data.map((item) =>
          prisma.externalRegistry.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry/external");
    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to reorder external registries:", error);
    return { success: false, error: "Failed to reorder registries" };
  }
}
