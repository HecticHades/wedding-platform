"use server";

import { prisma } from "@/lib/db/prisma";

/**
 * Fallback action for local development where onUploadCompleted doesn't fire.
 * In production, the onUploadCompleted webhook handles record creation.
 * For local dev without ngrok, call this after upload completes.
 */
export async function createGuestPhotoRecord(
  weddingId: string,
  url: string,
  guestName?: string
) {
  // Validate wedding exists and photo sharing is enabled
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { photoSharingEnabled: true },
  });

  if (!wedding) {
    return { error: "Wedding not found" };
  }

  if (!wedding.photoSharingEnabled) {
    return { error: "Photo sharing is not enabled" };
  }

  // Check if photo already exists (from onUploadCompleted webhook)
  const existing = await prisma.guestPhoto.findFirst({
    where: { url },
  });

  if (existing) {
    // Already created by webhook, skip
    return { success: true, id: existing.id };
  }

  // Create the photo record
  const photo = await prisma.guestPhoto.create({
    data: {
      weddingId,
      url,
      uploadedBy: guestName || "Anonymous",
      status: "PENDING",
    },
  });

  return { success: true, id: photo.id };
}
