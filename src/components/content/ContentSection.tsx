"use client";

import { EventDetailsSection } from "./sections/EventDetailsSection";
import { OurStorySection } from "./sections/OurStorySection";
import { TravelSection } from "./sections/TravelSection";
import { GallerySection } from "./sections/GallerySection";
import { TimelineSection } from "./sections/TimelineSection";
import { ContactSection } from "./sections/ContactSection";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ContentSectionProps {
  section: PrismaJson.ContentSection;
  theme: ThemeSettings;
}

/**
 * ContentSection is a router component that renders the appropriate section
 * component based on the section type. Theme is passed through to enable
 * consistent styling that matches the Theme Studio preview.
 */
export function ContentSection({ section, theme }: ContentSectionProps) {
  const content = section.content;

  // Render the appropriate section component based on type
  const renderSection = () => {
    switch (content.type) {
      case "event-details":
        // Events are now rendered by EventsDisplay from database
        return <EventDetailsSection />;
      case "our-story":
        return <OurStorySection content={content} theme={theme} />;
      case "travel":
        return <TravelSection content={content} theme={theme} />;
      case "gallery":
        return <GallerySection content={content} theme={theme} />;
      case "timeline":
        return <TimelineSection content={content} theme={theme} />;
      case "contact":
        return <ContactSection content={content} theme={theme} />;
      default:
        // Type guard to ensure exhaustive handling
        const _exhaustiveCheck: never = content;
        return null;
    }
  };

  return (
    <section
      id={section.type}
      className="scroll-mt-20"
      aria-labelledby={`${section.type}-heading`}
    >
      {renderSection()}
    </section>
  );
}
