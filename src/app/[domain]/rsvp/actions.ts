"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

/**
 * Validate RSVP code for a wedding and set authentication cookie
 */
export async function validateRsvpCode(
  weddingId: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { rsvpCode: true },
    });

    if (!wedding) {
      return { valid: false, error: "Wedding not found" };
    }

    if (!wedding.rsvpCode) {
      return { valid: false, error: "RSVP code not configured for this wedding" };
    }

    if (wedding.rsvpCode !== code) {
      return { valid: false, error: "Invalid RSVP code" };
    }

    // Set auth cookie (expires in 30 days)
    const cookieStore = await cookies();
    cookieStore.set(`rsvp_auth_${weddingId}`, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { valid: true };
  } catch (error) {
    console.error("Error validating RSVP code:", error);
    return { valid: false, error: "An error occurred. Please try again." };
  }
}

/**
 * Search for guests by name within a wedding
 */
export async function searchGuests(
  weddingId: string,
  searchName: string
): Promise<Array<{ id: string; name: string; partyName: string | null }>> {
  try {
    if (!searchName || searchName.trim().length < 2) {
      return [];
    }

    const guests = await prisma.guest.findMany({
      where: {
        weddingId,
        name: {
          contains: searchName.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        partyName: true,
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    });

    return guests;
  } catch (error) {
    console.error("Error searching guests:", error);
    return [];
  }
}

/**
 * Get wedding by tenant subdomain
 */
export async function getWeddingByDomain(
  domain: string
): Promise<{
  id: string;
  rsvpCode: string | null;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date | null;
  themeSettings: unknown;
} | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: domain },
      include: {
        wedding: {
          select: {
            id: true,
            rsvpCode: true,
            partner1Name: true,
            partner2Name: true,
            weddingDate: true,
            themeSettings: true,
          },
        },
      },
    });

    return tenant?.wedding ?? null;
  } catch (error) {
    console.error("Error getting wedding by domain:", error);
    return null;
  }
}
