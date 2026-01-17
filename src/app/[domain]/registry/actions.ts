"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Claim a gift atomically (prevents race conditions)
 */
export async function claimGift(giftId: string, guestName?: string) {
  try {
    // Use updateMany with condition for atomicity
    const result = await prisma.giftItem.updateMany({
      where: {
        id: giftId,
        isClaimed: false, // Only update if not already claimed
      },
      data: {
        isClaimed: true,
        claimedBy: guestName || "Anonymous",
        claimedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return { success: false, error: "This gift has already been claimed" };
    }

    revalidatePath("/[domain]/registry");
    return { success: true };
  } catch (error) {
    console.error("Failed to claim gift:", error);
    return { success: false, error: "Failed to claim gift" };
  }
}
