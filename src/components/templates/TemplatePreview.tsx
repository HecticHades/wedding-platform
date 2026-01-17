"use client";

import type { ThemeSettings } from "@/lib/content/theme-utils";
import { generateCSSVariablesObject } from "@/lib/content/theme-utils";

interface TemplatePreviewProps {
  theme: ThemeSettings;
  partner1Name?: string;
  partner2Name?: string;
}

/**
 * Mini live preview of a wedding site with the given theme applied
 * Uses CSS variables for runtime theme switching
 */
export function TemplatePreview({
  theme,
  partner1Name = "Jane",
  partner2Name = "John",
}: TemplatePreviewProps) {
  const cssVars = generateCSSVariablesObject(theme);

  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
      style={{
        ...cssVars,
        backgroundColor: "var(--wedding-background)",
        color: "var(--wedding-text)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: "var(--wedding-primary)" }}
      >
        <p
          className="text-center text-white text-sm font-medium"
          style={{ fontFamily: "var(--wedding-font-heading)" }}
        >
          {partner1Name} & {partner2Name}
        </p>
      </div>

      {/* Content preview */}
      <div className="p-4 space-y-3">
        {/* Heading sample */}
        <h4
          className="text-lg font-semibold text-center"
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "var(--wedding-primary)",
          }}
        >
          Our Wedding
        </h4>

        {/* Body text sample */}
        <p
          className="text-xs text-center leading-relaxed"
          style={{
            fontFamily: "var(--wedding-font-body)",
            color: "var(--wedding-text)",
          }}
        >
          Join us for a celebration of love and commitment.
        </p>

        {/* Button sample */}
        <div className="flex justify-center">
          <span
            className="inline-block px-3 py-1 text-xs font-medium rounded text-white"
            style={{ backgroundColor: "var(--wedding-secondary)" }}
          >
            RSVP Now
          </span>
        </div>
      </div>

      {/* Footer accent */}
      <div
        className="h-1"
        style={{ backgroundColor: "var(--wedding-accent)" }}
      />
    </div>
  );
}
