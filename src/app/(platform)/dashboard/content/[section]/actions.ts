"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import {
  sectionTypeSchema,
  sectionContentSchema,
  type SectionTypeId,
} from "@/lib/content/section-types";

/**
 * Update the content of a specific section
 */
export async function updateSectionContent(
  sectionType: SectionTypeId,
  content: PrismaJson.SectionContent
) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate section type
  const typeResult = sectionTypeSchema.safeParse(sectionType);
  if (!typeResult.success) {
    return { success: false, error: "Invalid section type" };
  }

  // Validate content matches section type
  const contentResult = sectionContentSchema.safeParse(content);
  if (!contentResult.success) {
    return {
      success: false,
      error: `Invalid content: ${contentResult.error.errors[0]?.message || "Validation failed"}`,
    };
  }

  // Ensure content type matches section type
  if (content.type !== sectionType) {
    return { success: false, error: "Content type does not match section type" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, contentSections: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const sections = (wedding.contentSections ?? []) as PrismaJson.ContentSection[];

    // Find section by type
    const sectionIndex = sections.findIndex((s) => s.type === sectionType);
    if (sectionIndex === -1) {
      return { success: false, error: "Section not found. Please add it first." };
    }

    // Update section content
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      content: content,
    };

    // Update wedding with modified sections
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        contentSections: sections,
      },
    });

    return { success: true };
  });

  revalidatePath("/dashboard/content");
  revalidatePath(`/dashboard/content/${sectionType}`);
  return result;
}
