"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getTemplate } from "@/lib/content/templates";
import type { SectionType } from "@/lib/content/templates";

/**
 * Create default empty section content based on section type
 */
function createDefaultSectionContent(type: SectionType): PrismaJson.SectionContent {
  switch (type) {
    case "event-details":
      return {
        type: "event-details",
        events: [],
      };
    case "our-story":
      return {
        type: "our-story",
        title: "Our Story",
        story: "",
      };
    case "travel":
      return {
        type: "travel",
        hotels: [],
      };
    case "gallery":
      return {
        type: "gallery",
        title: "Gallery",
        photos: [],
      };
    case "timeline":
      return {
        type: "timeline",
        title: "Day Schedule",
        events: [],
      };
    case "contact":
      return {
        type: "contact",
        title: "Contact",
        contacts: [],
      };
  }
}

/**
 * Create default content sections from template's default sections
 */
function createDefaultSections(
  sectionTypes: SectionType[]
): PrismaJson.ContentSection[] {
  return sectionTypes.map((type, index) => ({
    id: `section-${type}-${Date.now()}-${index}`,
    type,
    order: index,
    isVisible: true,
    content: createDefaultSectionContent(type),
  }));
}

export interface ApplyTemplateResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to apply a template to the current wedding
 * Updates templateId, themeSettings, and initializes contentSections if empty
 */
export async function applyTemplate(
  templateId: string
): Promise<ApplyTemplateResult> {
  // Validate session
  const session = await auth();

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  if (!session.user.tenantId) {
    return { success: false, error: "No tenant context" };
  }

  // Get template
  const template = getTemplate(templateId);
  if (!template) {
    return { success: false, error: "Template not found" };
  }

  try {
    // Use tenant context to scope the update
    await withTenantContext(session.user.tenantId, async () => {
      // First get the current wedding to check if contentSections is empty
      const currentWedding = await prisma.wedding.findFirst({
        select: { id: true, contentSections: true },
      });

      if (!currentWedding) {
        throw new Error("Wedding not found");
      }

      // Check if contentSections is empty (null, undefined, or empty array)
      const existingSections = currentWedding.contentSections as
        | PrismaJson.ContentSection[]
        | null;
      const hasExistingSections =
        existingSections && existingSections.length > 0;

      // Update wedding with template
      await prisma.wedding.update({
        where: { id: currentWedding.id },
        data: {
          templateId: template.id,
          themeSettings: template.theme,
          // Only initialize contentSections if empty
          ...(hasExistingSections
            ? {}
            : { contentSections: createDefaultSections(template.defaultSections) }),
        },
      });
    });

    // Revalidate the templates page to reflect the change
    revalidatePath("/dashboard/templates");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to apply template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply template",
    };
  }
}
