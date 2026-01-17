import { z } from "zod";

/**
 * Section type metadata for UI display
 */
export const SECTION_TYPES = [
  {
    id: "event-details" as const,
    label: "Event Details",
    icon: "calendar",
    description: "Wedding ceremony, reception, and other event information",
  },
  {
    id: "our-story" as const,
    label: "Our Story",
    icon: "heart",
    description: "Share how you met and your journey together",
  },
  {
    id: "travel" as const,
    label: "Travel & Hotels",
    icon: "map-pin",
    description: "Accommodation recommendations and directions",
  },
  {
    id: "gallery" as const,
    label: "Photo Gallery",
    icon: "image",
    description: "Engagement photos and memories",
  },
  {
    id: "timeline" as const,
    label: "Day-of Timeline",
    icon: "clock",
    description: "Schedule of events for the wedding day",
  },
  {
    id: "contact" as const,
    label: "Contact Info",
    icon: "mail",
    description: "Contact information for the couple or wedding party",
  },
] as const;

/**
 * Section type values
 */
export type SectionTypeId = (typeof SECTION_TYPES)[number]["id"];

/**
 * Zod schema for section type validation
 */
export const sectionTypeSchema = z.enum([
  "event-details",
  "our-story",
  "travel",
  "gallery",
  "timeline",
  "contact",
]);

/**
 * Event details content schema
 */
export const eventDetailsContentSchema = z.object({
  type: z.literal("event-details"),
  events: z.array(
    z.object({
      name: z.string().min(1, "Event name is required"),
      date: z.string().min(1, "Date is required"),
      time: z.string().min(1, "Time is required"),
      location: z.string().min(1, "Location is required"),
      address: z.string().min(1, "Address is required"),
      dressCode: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

/**
 * Our story content schema
 */
export const ourStoryContentSchema = z.object({
  type: z.literal("our-story"),
  title: z.string().min(1, "Title is required"),
  story: z.string().min(1, "Story is required"),
  photos: z.array(z.string().url()).optional(),
});

/**
 * Travel content schema
 */
export const travelContentSchema = z.object({
  type: z.literal("travel"),
  hotels: z.array(
    z.object({
      name: z.string().min(1, "Hotel name is required"),
      address: z.string().min(1, "Address is required"),
      phone: z.string().optional(),
      website: z.string().url().optional().or(z.literal("")),
      notes: z.string().optional(),
      bookingCode: z.string().optional(),
    })
  ),
  directions: z.string().optional(),
  airportInfo: z.string().optional(),
});

/**
 * Gallery content schema
 */
export const galleryContentSchema = z.object({
  type: z.literal("gallery"),
  title: z.string().min(1, "Title is required"),
  photos: z.array(
    z.object({
      url: z.string().url("Invalid photo URL"),
      caption: z.string().optional(),
      order: z.number().int().min(0),
    })
  ),
});

/**
 * Timeline content schema
 */
export const timelineContentSchema = z.object({
  type: z.literal("timeline"),
  title: z.string().min(1, "Title is required"),
  events: z.array(
    z.object({
      time: z.string().min(1, "Time is required"),
      title: z.string().min(1, "Event title is required"),
      description: z.string().optional(),
    })
  ),
});

/**
 * Contact content schema
 */
export const contactContentSchema = z.object({
  type: z.literal("contact"),
  title: z.string().min(1, "Title is required"),
  contacts: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      role: z.string().min(1, "Role is required"),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
    })
  ),
  message: z.string().optional(),
});

/**
 * Union schema for all section content types
 */
export const sectionContentSchema = z.discriminatedUnion("type", [
  eventDetailsContentSchema,
  ourStoryContentSchema,
  travelContentSchema,
  galleryContentSchema,
  timelineContentSchema,
  contactContentSchema,
]);

/**
 * Full content section schema
 */
export const contentSectionSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  order: z.number().int().min(0),
  isVisible: z.boolean(),
  content: sectionContentSchema,
});

/**
 * Array of content sections schema
 */
export const contentSectionsSchema = z.array(contentSectionSchema);

/**
 * Create an empty section with default content
 */
export function createEmptySection(
  type: SectionTypeId,
  order: number
): PrismaJson.ContentSection {
  const id = `${type}-${Date.now()}`;

  const emptyContentByType: Record<SectionTypeId, PrismaJson.SectionContent> = {
    "event-details": {
      type: "event-details",
      events: [],
    },
    "our-story": {
      type: "our-story",
      title: "Our Story",
      story: "",
      photos: [],
    },
    travel: {
      type: "travel",
      hotels: [],
      directions: "",
      airportInfo: "",
    },
    gallery: {
      type: "gallery",
      title: "Photo Gallery",
      photos: [],
    },
    timeline: {
      type: "timeline",
      title: "Wedding Day Timeline",
      events: [],
    },
    contact: {
      type: "contact",
      title: "Contact Us",
      contacts: [],
      message: "",
    },
  };

  return {
    id,
    type,
    order,
    isVisible: true,
    content: emptyContentByType[type],
  };
}

/**
 * Get human-readable label for a section type
 */
export function getSectionLabel(type: SectionTypeId): string {
  const sectionType = SECTION_TYPES.find((s) => s.id === type);
  return sectionType?.label ?? type;
}

/**
 * Get section metadata by type
 */
export function getSectionMetadata(type: SectionTypeId) {
  return SECTION_TYPES.find((s) => s.id === type);
}
