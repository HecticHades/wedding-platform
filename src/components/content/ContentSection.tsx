"use client";

import { EventDetailsSection } from "./sections/EventDetailsSection";
import { OurStorySection } from "./sections/OurStorySection";
import { TravelSection } from "./sections/TravelSection";
import { GallerySection } from "./sections/GallerySection";
import { TimelineSection } from "./sections/TimelineSection";
import { ContactSection } from "./sections/ContactSection";

interface ContentSectionProps {
  section: PrismaJson.ContentSection;
}

/**
 * ContentSection is a router component that renders the appropriate section
 * component based on the section type.
 */
export function ContentSection({ section }: ContentSectionProps) {
  const content = section.content;

  // Render the appropriate section component based on type
  const renderSection = () => {
    switch (content.type) {
      case "event-details":
        return <EventDetailsSection content={content} />;
      case "our-story":
        return <OurStorySection content={content} />;
      case "travel":
        return <TravelSection content={content} />;
      case "gallery":
        return <GallerySection content={content} />;
      case "timeline":
        return <TimelineSection content={content} />;
      case "contact":
        return <ContactSection content={content} />;
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
