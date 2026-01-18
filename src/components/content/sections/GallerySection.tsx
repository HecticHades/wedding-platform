import Image from "next/image";
import Link from "next/link";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface GallerySectionProps {
  content: PrismaJson.GalleryContent;
  theme: ThemeSettings;
}

/**
 * GallerySection displays a photo gallery with responsive grid layout.
 * Photos are loaded lazily for performance.
 * Styling matches the Theme Studio preview for consistency.
 */
export function GallerySection({ content, theme }: GallerySectionProps) {
  // Don't render if no photos
  if (content.photos.length === 0) {
    return null;
  }

  // Sort photos by order
  const sortedPhotos = [...content.photos].sort((a, b) => a.order - b.order);

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2
          id="gallery-heading"
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          {content.title || "Photo Gallery"}
        </h2>

        {/* Photo grid - responsive masonry-like layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedPhotos.map((photo, index) => (
            <div
              key={index}
              className={`
                group relative overflow-hidden rounded-lg cursor-pointer
                ${index === 0 ? "col-span-2 row-span-2" : ""}
              `}
              style={{ backgroundColor: `${theme.secondaryColor}30` }}
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.caption || `Gallery photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  loading="lazy"
                />
              </div>

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}80` }}
              >
                <span className="text-white text-sm font-medium">
                  {photo.caption || "View Photo"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View all photos button */}
        <div className="text-center mt-8">
          <Link
            href="photos"
            className="inline-block px-6 py-2 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: theme.primaryColor,
              color: "#ffffff",
            }}
          >
            View All Photos
          </Link>
        </div>
      </div>
    </div>
  );
}
