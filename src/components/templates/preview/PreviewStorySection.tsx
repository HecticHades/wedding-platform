"use client";

import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { getSectionBackgroundStyle } from "@/lib/content/theme-utils";

interface PreviewStorySectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewStorySection({ content, theme }: PreviewStorySectionProps) {
  const sectionBgStyle = getSectionBackgroundStyle(theme, "base");

  return (
    <section
      className="py-20 px-4"
      style={sectionBgStyle}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="font-bold mb-8"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
            fontSize: "var(--wedding-font-size-heading, 2rem)",
          }}
        >
          {content.story.title}
        </h2>

        <div className="space-y-6">
          {content.story.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="leading-relaxed"
              style={{
                fontFamily: theme.fontFamily,
                color: theme.textColor,
                fontSize: "var(--wedding-font-size-base, 1rem)",
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

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
    </section>
  );
}
