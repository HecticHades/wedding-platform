"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Schema for hero image settings
 */
const heroImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  overlay: z.enum(["none", "light", "dark", "gradient"]),
  overlayOpacity: z.number().min(10).max(80),
  position: z.enum(["top", "center", "bottom"]),
}).optional();

/**
 * Schema for validating theme settings
 */
const themeSchema = z.object({
  // Core colors
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  backgroundColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  textColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"),

  // Typography
  fontFamily: z.string().min(1, "Font family is required"),
  headingFont: z.string().min(1, "Heading font is required"),

  // Extended style options (optional)
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  lineHeight: z.enum(["compact", "normal", "relaxed"]).optional(),
  borderRadius: z.enum(["none", "subtle", "rounded"]).optional(),
  shadowIntensity: z.enum(["none", "subtle", "medium", "dramatic"]).optional(),
  sectionStyle: z.enum(["solid", "gradient", "pattern"]).optional(),
  buttonStyle: z.enum(["solid", "outline", "soft"]).optional(),
  dividerStyle: z.enum(["none", "line", "ornament", "flourish"]).optional(),

  // Hero image (optional)
  heroImage: heroImageSchema,
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

    // Get tenant subdomain to revalidate public site
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { subdomain: true },
    });

    // Revalidate dashboard pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/theme");

    // Revalidate tenant's public site (theme is loaded in layout)
    if (tenant?.subdomain) {
      // Revalidate layout to refresh theme data cached in layout.tsx
      revalidatePath(`/${tenant.subdomain}`, "layout");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update theme",
    };
  }
}
