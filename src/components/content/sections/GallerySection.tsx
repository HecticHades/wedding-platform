import Image from "next/image";

interface GallerySectionProps {
  content: PrismaJson.GalleryContent;
}

/**
 * GallerySection displays a photo gallery with responsive grid layout.
 * Photos are loaded lazily for performance.
 */
export function GallerySection({ content }: GallerySectionProps) {
  // Don't render if no photos
  if (content.photos.length === 0) {
    return null;
  }

  // Sort photos by order
  const sortedPhotos = [...content.photos].sort((a, b) => a.order - b.order);

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-secondary/5">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2
          id="gallery-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-10"
        >
          {content.title || "Photo Gallery"}
        </h2>

        {/* Photo grid - responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedPhotos.map((photo, index) => (
            <div key={index} className="group">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-wedding-primary/5">
                <Image
                  src={photo.url}
                  alt={photo.caption || `Gallery photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
              {/* Caption */}
              {photo.caption && (
                <p className="mt-2 font-wedding text-sm text-wedding-text/70 text-center">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
