"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Monitor, Tablet, Smartphone, Eye, AlertTriangle } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { generateCSSVariablesObject, hasGoodContrast } from "@/lib/content/theme-utils";
import { PreviewHeroSection } from "@/components/templates/preview/PreviewHeroSection";
import { PreviewStorySection } from "@/components/templates/preview/PreviewStorySection";
import { PreviewEventsSection } from "@/components/templates/preview/PreviewEventsSection";
import { PreviewGallerySection } from "@/components/templates/preview/PreviewGallerySection";
import { PreviewTravelSection } from "@/components/templates/preview/PreviewTravelSection";
import { PreviewFooter } from "@/components/templates/preview/PreviewFooter";
import { getPreviewContent } from "@/components/templates/preview/previewContent";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeDivider } from "@/components/theme/ThemeDivider";

interface EnhancedLivePreviewProps {
  theme: ThemeSettings;
  partner1Name?: string;
  partner2Name?: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIGS = {
  desktop: { width: "100%", label: "Desktop", icon: Monitor },
  tablet: { width: "768px", label: "Tablet", icon: Tablet },
  mobile: { width: "375px", label: "Mobile", icon: Smartphone },
} as const;

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "story", label: "Our Story" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "travel", label: "Travel" },
  { id: "footer", label: "Footer" },
] as const;

export function EnhancedLivePreview({
  theme,
  partner1Name = "Emma",
  partner2Name = "James",
}: EnhancedLivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const content = getPreviewContent(partner1Name, partner2Name);
  const cssVars = generateCSSVariablesObject(theme);

  // Check contrast for accessibility
  const textContrastOk = hasGoodContrast(theme.textColor, theme.backgroundColor);
  const primaryContrastOk = hasGoodContrast(theme.primaryColor, theme.backgroundColor);

  // Calculate scale for preview
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth - 32; // padding
    const targetWidth = device === "desktop" ? 1280 : device === "tablet" ? 768 : 375;

    const newScale = Math.min(containerWidth / targetWidth, 1);
    setScale(newScale);
  }, [device]);

  useEffect(() => {
    calculateScale();

    const observer = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [calculateScale]);

  const scrollToSection = (sectionId: string) => {
    const element = previewRef.current?.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const deviceConfig = DEVICE_CONFIGS[device];
  const previewWidth = device === "desktop" ? 1280 : device === "tablet" ? 768 : 375;

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-xl overflow-hidden">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(DEVICE_CONFIGS) as DeviceType[]).map((deviceKey) => {
            const config = DEVICE_CONFIGS[deviceKey];
            const Icon = config.icon;
            const isActive = device === deviceKey;

            return (
              <button
                key={deviceKey}
                onClick={() => setDevice(deviceKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title={config.label}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section quick-jump */}
        <div className="hidden md:flex items-center gap-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Accessibility indicator */}
        <div className="flex items-center gap-2">
          {(!textContrastOk || !primaryContrastOk) && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Low contrast</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500">
            <Eye className="h-3.5 w-3.5" />
            <span>{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex justify-center"
      >
        <div
          className="bg-white shadow-xl transition-all duration-300 origin-top"
          style={{
            width: `${previewWidth}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            minHeight: scale < 1 ? `${600 / scale}px` : "auto",
          }}
        >
          <ThemeProvider theme={theme}>
            <div
              ref={previewRef}
              style={{ ...cssVars }}
              className="w-full"
            >
              {/* Hero Section */}
              <div data-section="hero">
                <PreviewHeroSection content={content} theme={theme} />
              </div>

              {/* Divider */}
              <ThemeDivider />

              {/* Story Section */}
              <div data-section="story">
                <PreviewStorySection content={content} theme={theme} />
              </div>

              {/* Divider */}
              <ThemeDivider />

              {/* Events Section */}
              <div data-section="events">
                <PreviewEventsSection content={content} theme={theme} />
              </div>

              {/* Divider */}
              <ThemeDivider />

              {/* Gallery Section */}
              <div data-section="gallery">
                <PreviewGallerySection content={content} theme={theme} />
              </div>

              {/* Divider */}
              <ThemeDivider />

              {/* Travel Section */}
              <div data-section="travel">
                <PreviewTravelSection content={content} theme={theme} />
              </div>

              {/* Footer */}
              <div data-section="footer">
                <PreviewFooter content={content} theme={theme} />
              </div>
            </div>
          </ThemeProvider>
        </div>
      </div>

      {/* Contrast warning detail */}
      {(!textContrastOk || !primaryContrastOk) && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Accessibility Warning:</strong>
              {!textContrastOk && (
                <span className="ml-1">
                  Text color may be hard to read on the background.
                </span>
              )}
              {!primaryContrastOk && (
                <span className="ml-1">
                  Primary color may lack contrast with background.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
