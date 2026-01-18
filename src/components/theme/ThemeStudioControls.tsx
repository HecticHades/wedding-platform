"use client";

import { useState } from "react";
import { Palette, Type, Sparkles, Wand2, Image } from "lucide-react";
import type { ThemeSettings, WeddingPreset } from "@/lib/content/theme-utils";
import { ColorPalettePanel } from "./controls/ColorPalettePanel";
import { TypographyPanel } from "./controls/TypographyPanel";
import { StylePanel } from "./controls/StylePanel";
import { PresetGallery } from "./controls/PresetGallery";
import { HeroImageUploader } from "./HeroImageUploader";

interface ThemeStudioControlsProps {
  theme: ThemeSettings;
  initialTheme: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
  onApplyPreset: (preset: WeddingPreset) => void;
}

const TABS = [
  { id: "colors", label: "Colors", icon: Palette },
  { id: "hero", label: "Hero Image", icon: Image },
  { id: "typography", label: "Typography", icon: Type },
  { id: "style", label: "Style", icon: Sparkles },
  { id: "presets", label: "Presets", icon: Wand2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ThemeStudioControls({
  theme,
  initialTheme,
  onChange,
  onApplyPreset,
}: ThemeStudioControlsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("colors");

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Tab navigation */}
      <div
        className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 bg-gray-50"
        role="tablist"
        aria-label="Theme settings tabs"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-white text-violet-600 border-b-2 border-violet-500 -mb-px"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        className="flex-1 overflow-y-auto p-4"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "colors" && (
          <ColorPalettePanel theme={theme} onChange={onChange} />
        )}

        {activeTab === "typography" && (
          <TypographyPanel theme={theme} onChange={onChange} />
        )}

        {activeTab === "style" && (
          <StylePanel theme={theme} onChange={onChange} />
        )}

        {activeTab === "hero" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Hero Image
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Add a stunning photo to your wedding site hero section
              </p>
            </div>
            <HeroImageUploader
              value={theme.heroImage}
              onChange={(heroImage) => onChange({ heroImage })}
            />
          </div>
        )}

        {activeTab === "presets" && (
          <PresetGallery
            theme={theme}
            initialTheme={initialTheme}
            onChange={onChange}
            onApplyPreset={onApplyPreset}
          />
        )}
      </div>
    </div>
  );
}
