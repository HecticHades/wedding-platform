"use client";

import { useState } from "react";
import { PhotoCard } from "./PhotoCard";
import { PhotoLightbox, type Photo } from "./PhotoLightbox";

interface PhotoGalleryProps {
  photos: Photo[];
}

/**
 * Combined photo gallery showing couple and approved guest photos.
 * Responsive grid with lightbox viewing.
 */
export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {photos.map((photo, index) => (
          <PhotoCard
            key={`${photo.url}-${index}`}
            url={photo.url}
            caption={photo.caption}
            uploadedBy={photo.uploadedBy}
            isGuestPhoto={photo.isGuestPhoto}
            index={index}
            onClick={() => handlePhotoClick(index)}
          />
        ))}
      </div>

      {/* Lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
