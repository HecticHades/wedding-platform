"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Schema for validating theme settings
 */
const themeSchema = z.object({
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  backgroundColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  textColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  fontFamily: z.string().min(1, "Font family is required"),
  headingFont: z.string().min(1, "Heading font is required"),
});

export type ThemeSettingsInput = z.infer<typeof themeSchema>;

export type UpdateThemeResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to update wedding theme settings
 */
export async function updateTheme(
  theme: ThemeSettingsInput
): Promise<UpdateThemeResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    if (!session.user.tenantId) {
      return { success: false, error: "No tenant context" };
    }

    // Validate theme settings
    const result = themeSchema.safeParse(theme);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    const validatedTheme = result.data;

    // Update within tenant context
    await withTenantContext(session.user.tenantId, async () => {
      const wedding = await prisma.wedding.findFirst();

      if (!wedding) {
        throw new Error("Wedding not found");
      }

      await prisma.wedding.update({
        where: { id: wedding.id },
        data: {
          themeSettings: validatedTheme,
        },
      });
    });

    // Revalidate dashboard pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/theme");

    return { success: true };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update theme",
    };
  }
}
