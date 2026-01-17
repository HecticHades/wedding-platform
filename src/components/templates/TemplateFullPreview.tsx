"use client";

import type { ThemeSettings } from "@/lib/content/theme-utils";
import { generateCSSVariablesObject } from "@/lib/content/theme-utils";
import {
  PreviewHeroSection,
  PreviewStorySection,
  PreviewEventsSection,
  PreviewGallerySection,
  PreviewTravelSection,
  PreviewFooter,
  defaultPreviewContent,
  type PreviewContent,
} from "./preview";

interface TemplateFullPreviewProps {
  theme: ThemeSettings;
  content?: Partial<PreviewContent>;
  partner1Name?: string;
  partner2Name?: string;
}

export function TemplateFullPreview({
  theme,
  content: contentOverride,
  partner1Name,
  partner2Name,
}: TemplateFullPreviewProps) {
  const cssVars = generateCSSVariablesObject(theme);

  // Merge content with defaults
  const content: PreviewContent = {
    ...defaultPreviewContent,
    ...contentOverride,
    couple: {
      ...defaultPreviewContent.couple,
      ...contentOverride?.couple,
      partner1: partner1Name || defaultPreviewContent.couple.partner1,
      partner2: partner2Name || defaultPreviewContent.couple.partner2,
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...cssVars,
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
      }}
    >
      <PreviewHeroSection content={content} theme={theme} />
      <PreviewStorySection content={content} theme={theme} />
      <PreviewEventsSection content={content} theme={theme} />
      <PreviewGallerySection content={content} theme={theme} />
      <PreviewTravelSection content={content} theme={theme} />
      <PreviewFooter content={content} theme={theme} />
    </div>
  );
}
