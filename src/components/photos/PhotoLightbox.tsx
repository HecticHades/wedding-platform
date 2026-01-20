"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export interface Photo {
  url: string;
  caption?: string | null;
  uploadedBy?: string | null;
  isGuestPhoto?: boolean;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

/**
 * Custom loading indicator component for the lightbox.
 * Shows a spinner while images are loading.
 */
function LoadingIndicator() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"
          role="status"
          aria-label="Loading image"
        />
        <span className="text-white/70 text-sm">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Full-screen lightbox for viewing photos.
 * Supports zoom, swipe navigation on mobile, and keyboard controls.
 * Includes loading indicator for large images.
 */
export function PhotoLightbox({
  photos,
  initialIndex,
  open,
  onClose,
}: PhotoLightboxProps) {
  // Convert photos to lightbox slides format
  const slides = photos.map((photo) => ({
    src: photo.url,
    alt: photo.caption || "Wedding photo",
    title: photo.caption || undefined,
    description: photo.uploadedBy ? `Photo by ${photo.uploadedBy}` : undefined,
  }));

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Zoom, Thumbnails]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      thumbnails={{
        position: "bottom",
        width: 80,
        height: 60,
        border: 0,
        borderRadius: 4,
        gap: 8,
      }}
      carousel={{
        finite: false,
        preload: 2,
      }}
      animation={{
        swipe: 250,
        fade: 200,
      }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
      }}
      render={{
        // Custom loading indicator
        iconLoading: () => <LoadingIndicator />,
        // Improve accessibility
        buttonPrev: ({ ...props }) => (
          <button {...props} aria-label="Previous photo" />
        ),
        buttonNext: ({ ...props }) => (
          <button {...props} aria-label="Next photo" />
        ),
        buttonClose: ({ ...props }) => (
          <button {...props} aria-label="Close lightbox" />
        ),
        buttonZoom: ({ ...props }) => (
          <button {...props} aria-label="Toggle zoom" />
        ),
      }}
      styles={{
        container: {
          backgroundColor: "rgba(0, 0, 0, 0.95)",
        },
      }}
    />
  );
}
