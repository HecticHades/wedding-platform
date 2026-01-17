"use client";

import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface PreviewGallerySectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewGallerySection({ content, theme }: PreviewGallerySectionProps) {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          Our Moments
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {content.gallery.map((image, index) => (
            <div
              key={index}
              className={`
                relative overflow-hidden rounded-lg
                ${index === 0 ? "col-span-2 row-span-2" : ""}
              `}
              style={{
                aspectRatio: index === 0 ? "1" : "1",
                backgroundColor: `${theme.secondaryColor}30`,
              }}
            >
              {/* Placeholder for images */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-12 h-12 opacity-30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: theme.textColor }}
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}80` }}
              >
                <span className="text-white text-sm font-medium">
                  View Photo
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            className="px-6 py-2 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: theme.primaryColor,
              color: "#ffffff",
            }}
          >
            View All Photos
          </button>
        </div>
      </div>
    </section>
  );
}
