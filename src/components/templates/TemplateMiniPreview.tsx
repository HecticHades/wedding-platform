"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { generateCSSVariablesObject } from "@/lib/content/theme-utils";

interface TemplateMiniPreviewProps {
  theme: ThemeSettings;
  partner1Name?: string;
  partner2Name?: string;
  scale?: number;
  fillContainer?: boolean;
}

export function TemplateMiniPreview({
  theme,
  partner1Name = "Emma",
  partner2Name = "James",
  scale = 0.25,
  fillContainer = false,
}: TemplateMiniPreviewProps) {
  const cssVars = generateCSSVariablesObject(theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicScale, setDynamicScale] = useState(scale);

  // Base dimensions for the preview template
  const baseWidth = 800;
  const baseHeight = 600;

  const calculateScale = useCallback(() => {
    if (!fillContainer || !containerRef.current) {
      setDynamicScale(scale);
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = containerWidth / baseWidth;
    const scaleY = containerHeight / baseHeight;
    const newScale = Math.min(scaleX, scaleY);

    setDynamicScale(newScale);
  }, [fillContainer, scale]);

  useEffect(() => {
    if (!fillContainer) return;

    calculateScale();

    const observer = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fillContainer, calculateScale]);

  const actualScale = fillContainer ? dynamicScale : scale;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg w-full h-full"
      style={fillContainer ? {} : { height: `${baseHeight * scale}px` }}
    >
      <div
        className={fillContainer ? "absolute inset-0 flex items-center justify-center" : ""}
      >
        <div
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${actualScale})`,
            transformOrigin: fillContainer ? "center center" : "top left",
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
    </div>
  );
}
