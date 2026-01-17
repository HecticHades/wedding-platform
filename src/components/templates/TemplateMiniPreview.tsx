"use client";

import type { ThemeSettings } from "@/lib/content/theme-utils";
import { generateCSSVariablesObject } from "@/lib/content/theme-utils";

interface TemplateMiniPreviewProps {
  theme: ThemeSettings;
  partner1Name?: string;
  partner2Name?: string;
  scale?: number;
}

export function TemplateMiniPreview({
  theme,
  partner1Name = "Emma",
  partner2Name = "James",
  scale = 0.25,
}: TemplateMiniPreviewProps) {
  const cssVars = generateCSSVariablesObject(theme);

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height: `${400 * scale}px` }}
    >
      <div
        className="origin-top-left"
        style={{
          width: "400px",
          height: "600px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            ...cssVars,
            backgroundColor: theme.backgroundColor,
          }}
        >
          {/* Mini hero section */}
          <div
            className="relative h-[300px] flex items-center justify-center text-center p-6"
            style={{
              backgroundColor: theme.primaryColor,
              backgroundImage: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
            }}
          >
            <div className="relative z-10">
              <p className="text-white text-xs uppercase tracking-wider opacity-70 mb-2">
                We're getting married
              </p>
              <h1
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: theme.headingFont }}
              >
                {partner1Name}
              </h1>
              <p className="text-white text-xl">&</p>
              <h1
                className="text-4xl font-bold text-white"
                style={{ fontFamily: theme.headingFont }}
              >
                {partner2Name}
              </h1>
              <p className="text-white mt-4 text-sm">June 15, 2025</p>
            </div>
          </div>

          {/* Mini content section */}
          <div
            className="p-6"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <h2
              className="text-xl font-bold mb-3 text-center"
              style={{
                color: theme.primaryColor,
                fontFamily: theme.headingFont,
              }}
            >
              Our Story
            </h2>
            <div className="space-y-2">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: `${theme.textColor}20` }}
              />
              <div
                className="h-2 rounded w-4/5"
                style={{ backgroundColor: `${theme.textColor}20` }}
              />
              <div
                className="h-2 rounded w-3/5"
                style={{ backgroundColor: `${theme.textColor}20` }}
              />
            </div>

            {/* Mini button */}
            <div className="flex justify-center mt-6">
              <div
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                RSVP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
