import Image from "next/image";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface OurStorySectionProps {
  content: PrismaJson.OurStoryContent;
  theme: ThemeSettings;
}

/**
 * OurStorySection displays the couple's story with optional photos.
 * Renders the story text with proper paragraph formatting and a photo gallery.
 * Styling matches the Theme Studio preview for consistency.
 */
export function OurStorySection({ content, theme }: OurStorySectionProps) {
  // Don't render if no story content
  if (!content.story.trim()) {
    return null;
  }

  // Split story into paragraphs for proper formatting
  const paragraphs = content.story
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0);

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Title */}
        <h2
          id="our-story-heading"
          className="text-3xl md:text-4xl font-bold mb-8"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          {content.title || "Our Story"}
        </h2>

        {/* Story text */}
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg leading-relaxed"
              style={{
                fontFamily: theme.fontFamily,
                color: theme.textColor,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Photo gallery - if photos exist */}
        {content.photos && content.photos.length > 0 && (
          <div className="mt-10">
            <div
              className={`grid gap-4 ${
                content.photos.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : content.photos.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 md:grid-cols-3"
              }`}
            >
              {content.photos.map((photoUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md"
                >
                  <Image
                    src={photoUrl}
                    alt={`Our story photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decorative element */}
        <div className="mt-12 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.accentColor}20` }}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: theme.accentColor }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
