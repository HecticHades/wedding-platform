"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  sectionTypeSchema,
  createEmptySection,
  type SectionTypeId,
} from "@/lib/content/section-types";

/**
 * Add a new content section to the wedding
 */
export async function addSection(type: SectionTypeId) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate section type
  const parsed = sectionTypeSchema.safeParse(type);
  if (!parsed.success) {
    return { success: false, error: "Invalid section type" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, contentSections: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const sections = (wedding.contentSections ?? []) as PrismaJson.ContentSection[];

    // Check if section type already exists
    if (sections.some((s) => s.type === type)) {
      return { success: false, error: "Section type already exists" };
    }

    // Create new section
    const newSection = createEmptySection(type, sections.length);

    // Update wedding with new section
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        contentSections: [...sections, newSection],
      },
    });

    return { success: true, sectionId: newSection.id };
  });

  revalidatePath("/dashboard/content");
  return result;
}

/**
 * Update the order of content sections
 */
export async function updateSectionOrder(
  orderedSections: { id: string; order: number }[]
) {
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

  const parsed = orderSchema.safeParse(orderedSections);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, contentSections: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const sections = (wedding.contentSections ?? []) as PrismaJson.ContentSection[];

    // Create a map for quick lookup of new orders
    const orderMap = new Map(orderedSections.map((s) => [s.id, s.order]));

    // Update order for each section
    const updatedSections = sections.map((section) => ({
      ...section,
      order: orderMap.get(section.id) ?? section.order,
    }));

    // Sort by order
    updatedSections.sort((a, b) => a.order - b.order);

    // Update wedding
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        contentSections: updatedSections,
      },
    });

    return { success: true };
  });

  revalidatePath("/dashboard/content");
  return result;
}

/**
 * Toggle visibility of a content section
 */
export async function toggleSectionVisibility(sectionId: string) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!sectionId) {
    return { success: false, error: "Section ID is required" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, contentSections: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const sections = (wedding.contentSections ?? []) as PrismaJson.ContentSection[];

    // Find and toggle section visibility
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) {
      return { success: false, error: "Section not found" };
    }

    sections[sectionIndex].isVisible = !sections[sectionIndex].isVisible;

    // Update wedding
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        contentSections: sections,
      },
    });

    return { success: true, isVisible: sections[sectionIndex].isVisible };
  });

  revalidatePath("/dashboard/content");
  return result;
}

/**
 * Delete a content section
 */
export async function deleteSection(sectionId: string) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!sectionId) {
    return { success: false, error: "Section ID is required" };
  }

  const result = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { id: true, contentSections: true },
    });

    if (!wedding) {
      return { success: false, error: "Wedding not found" };
    }

    const sections = (wedding.contentSections ?? []) as PrismaJson.ContentSection[];

    // Filter out the section
    const filteredSections = sections.filter((s) => s.id !== sectionId);

    if (filteredSections.length === sections.length) {
      return { success: false, error: "Section not found" };
    }

    // Re-number remaining sections to be sequential
    const renumberedSections = filteredSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    // Update wedding
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        contentSections: renumberedSections,
      },
    });

    return { success: true };
  });

  revalidatePath("/dashboard/content");
  return result;
}
