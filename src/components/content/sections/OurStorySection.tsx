import Image from "next/image";

interface OurStorySectionProps {
  content: PrismaJson.OurStoryContent;
}

/**
 * OurStorySection displays the couple's story with optional photos.
 * Renders the story text with proper paragraph formatting and a photo gallery.
 */
export function OurStorySection({ content }: OurStorySectionProps) {
  // Don't render if no story content
  if (!content.story.trim()) {
    return null;
  }

  // Split story into paragraphs for proper formatting
  const paragraphs = content.story
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0);

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-primary/5">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          id="our-story-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-8"
        >
          {content.title || "Our Story"}
        </h2>

        {/* Story text */}
        <div className="space-y-4 font-wedding text-wedding-text leading-relaxed text-center md:text-left">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
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
      </div>
    </div>
  );
}
