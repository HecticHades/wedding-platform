/**
 * Type definitions for Prisma JSON fields
 * Used by prisma-json-types-generator to provide type safety
 */
declare global {
  namespace PrismaJson {
    /**
     * Theme customization settings stored in Wedding.themeSettings
     */
    interface ThemeSettings {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      headingFont: string;
    }

    /**
     * Section type identifiers
     */
    type SectionType =
      | "event-details"
      | "our-story"
      | "travel"
      | "gallery"
      | "timeline"
      | "contact";

    /**
     * Base content section structure stored in Wedding.contentSections
     */
    interface ContentSection {
      id: string;
      type: SectionType;
      order: number;
      isVisible: boolean;
      content: SectionContent;
    }

    /**
     * Event details section content
     */
    interface EventDetailsContent {
      type: "event-details";
      events: Array<{
        name: string;
        date: string;
        time: string;
        location: string;
        address: string;
        dressCode?: string;
        description?: string;
      }>;
    }

    /**
     * Our story section content
     */
    interface OurStoryContent {
      type: "our-story";
      title: string;
      story: string;
      photos?: string[];
    }

    /**
     * Travel and accommodations section content
     */
    interface TravelContent {
      type: "travel";
      hotels: Array<{
        name: string;
        address: string;
        phone?: string;
        website?: string;
        notes?: string;
        bookingCode?: string;
      }>;
      directions?: string;
      airportInfo?: string;
    }

    /**
     * Photo gallery section content
     */
    interface GalleryContent {
      type: "gallery";
      title: string;
      photos: Array<{
        url: string;
        caption?: string;
        order: number;
      }>;
    }

    /**
     * Day-of timeline section content
     */
    interface TimelineContent {
      type: "timeline";
      title: string;
      events: Array<{
        time: string;
        title: string;
        description?: string;
      }>;
    }

    /**
     * Contact information section content
     */
    interface ContactContent {
      type: "contact";
      title: string;
      contacts: Array<{
        name: string;
        role: string;
        email?: string;
        phone?: string;
      }>;
      message?: string;
    }

    /**
     * Union type of all section content types
     */
    type SectionContent =
      | EventDetailsContent
      | OurStoryContent
      | TravelContent
      | GalleryContent
      | TimelineContent
      | ContactContent;
  }
}

export {};
