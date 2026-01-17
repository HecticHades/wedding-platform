"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { PhotoStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

type CountResult =
  | { success: true; count: number }
  | { success: false; error: string };

/**
 * Moderate a single guest photo (approve or reject)
 */
export async function moderatePhoto(
  photoId: string,
  action: "approve" | "reject"
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!photoId) {
    return { success: false, error: "Photo ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify photo exists and belongs to this tenant's wedding
      const existingPhoto = await prisma.guestPhoto.findFirst({
        where: { id: photoId },
        select: { id: true },
      });

      if (!existingPhoto) {
        return { success: false as const, error: "Photo not found" };
      }

      // Update photo status
      await prisma.guestPhoto.update({
        where: { id: photoId },
        data: {
          status: action === "approve" ? PhotoStatus.APPROVED : PhotoStatus.REJECTED,
          reviewedAt: new Date(),
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/photos");
    revalidatePath("/dashboard/photos/moderation");
    return result;
  } catch (error) {
    console.error("Failed to moderate photo:", error);
    return { success: false, error: "Failed to moderate photo" };
  }
}

/**
 * Bulk moderate multiple guest photos
 */
export async function bulkModerate(
  photoIds: string[],
  action: "approve" | "reject"
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!photoIds || photoIds.length === 0) {
    return { success: false, error: "No photos selected" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Update all selected photos
      await prisma.guestPhoto.updateMany({
        where: {
          id: { in: photoIds },
        },
        data: {
          status: action === "approve" ? PhotoStatus.APPROVED : PhotoStatus.REJECTED,
          reviewedAt: new Date(),
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/photos");
    revalidatePath("/dashboard/photos/moderation");
    return result;
  } catch (error) {
    console.error("Failed to bulk moderate photos:", error);
    return { success: false, error: "Failed to moderate photos" };
  }
}

/**
 * Update photo sharing settings (enable/disable)
 */
export async function updatePhotoSettings(
  enabled: boolean
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Update wedding photo sharing setting
      const wedding = await prisma.wedding.findFirst({
        select: { id: true },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      await prisma.wedding.update({
        where: { id: wedding.id },
        data: { photoSharingEnabled: enabled },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/photos");
    revalidatePath("/dashboard/photos/settings");
    return result;
  } catch (error) {
    console.error("Failed to update photo settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Delete a guest photo (and remove from blob storage)
 */
export async function deletePhoto(photoId: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!photoId) {
    return { success: false, error: "Photo ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get photo to retrieve URL for blob deletion
      const photo = await prisma.guestPhoto.findFirst({
        where: { id: photoId },
        select: { id: true, url: true },
      });

      if (!photo) {
        return { success: false as const, error: "Photo not found" };
      }

      // Delete from database
      await prisma.guestPhoto.delete({
        where: { id: photoId },
      });

      // Try to delete from blob storage (non-blocking)
      try {
        await del(photo.url);
      } catch (blobError) {
        console.error("Failed to delete blob (continuing):", blobError);
        // Continue even if blob deletion fails
      }

      return { success: true as const };
    });

    revalidatePath("/dashboard/photos");
    revalidatePath("/dashboard/photos/moderation");
    return result;
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}

/**
 * Get count of pending guest photos (for badge display)
 */
export async function getPendingPhotosCount(): Promise<CountResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      const count = await prisma.guestPhoto.count({
        where: { status: PhotoStatus.PENDING },
      });

      return { success: true as const, count };
    });

    return result;
  } catch (error) {
    console.error("Failed to get pending photos count:", error);
    return { success: false, error: "Failed to get count" };
  }
}

/**
 * Get photo stats for dashboard
 */
export async function getPhotoStats(): Promise<{
  success: boolean;
  pending?: number;
  approved?: number;
  rejected?: number;
  total?: number;
  error?: string;
}> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const stats = await withTenantContext(session.user.tenantId, async () => {
      const [pending, approved, rejected] = await Promise.all([
        prisma.guestPhoto.count({ where: { status: PhotoStatus.PENDING } }),
        prisma.guestPhoto.count({ where: { status: PhotoStatus.APPROVED } }),
        prisma.guestPhoto.count({ where: { status: PhotoStatus.REJECTED } }),
      ]);

      return {
        success: true as const,
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      };
    });

    return stats;
  } catch (error) {
    console.error("Failed to get photo stats:", error);
    return { success: false, error: "Failed to get stats" };
  }
}
