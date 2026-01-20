/**
 * Type definitions for Prisma JSON fields
 * Used by prisma-json-types-generator to provide type safety
 */
declare global {
  namespace PrismaJson {
    /**
     * Meal option for event RSVP stored in Event.mealOptions
     */
    interface MealOption {
      id: string;
      name: string;
      description?: string;
    }

    /**
     * Hero image settings for wedding site
     */
    interface HeroImageSettings {
      url: string;
      alt?: string;
      overlay: 'none' | 'light' | 'dark' | 'gradient';
      overlayOpacity: number; // 10-80
      position: 'top' | 'center' | 'bottom';
    }

    /**
     * Theme customization settings stored in Wedding.themeSettings
     */
    interface ThemeSettings {
      // Core colors
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      accentColor: string;

      // Typography
      fontFamily: string;
      headingFont: string;

      // Extended style options (optional)
      fontSize?: 'small' | 'medium' | 'large';
      lineHeight?: 'compact' | 'normal' | 'relaxed';
      borderRadius?: 'none' | 'subtle' | 'rounded';
      shadowIntensity?: 'none' | 'subtle' | 'medium' | 'dramatic';
      sectionStyle?: 'solid' | 'gradient' | 'pattern';
      buttonStyle?: 'solid' | 'outline' | 'soft';
      dividerStyle?: 'none' | 'line' | 'ornament' | 'flourish';

      // Hero image (optional)
      heroImage?: HeroImageSettings;
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

    /**
     * Payment settings for gift registry stored in Wedding.paymentSettings
     */
    interface PaymentSettings {
      enabled: boolean;
      method: 'bank_transfer' | 'paypal' | 'twint' | null;

      // Bank transfer (EPC QR code for EUR, text display for CHF)
      bankTransfer?: {
        accountName: string;
        iban: string;
        bic?: string;
        currency: 'EUR' | 'CHF';
      };

      // PayPal.me link
      paypal?: {
        username: string;
        currency?: string;
      };

      // Twint (Swiss - display instructions only)
      twint?: {
        displayText: string;
        phoneNumber?: string;
      };
    }

    /**
     * Photo sharing settings for guest photo uploads
     */
    interface PhotoSettings {
      enabled: boolean;
      allowGuestUploads: boolean;
      requireModeration: boolean;
    }
  }
}

export {};
