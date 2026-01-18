"use client";

import { useState } from "react";
import { Check, Undo2 } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { WEDDING_PRESETS, type WeddingPreset } from "@/lib/content/theme-utils";

interface PresetGalleryProps {
  theme: ThemeSettings;
  initialTheme: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
  onApplyPreset: (preset: WeddingPreset) => void;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "romantic", label: "Romantic" },
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "nature", label: "Nature" },
  { id: "seasonal", label: "Seasonal" },
] as const;

export function PresetGallery({
  theme,
  initialTheme,
  onChange,
  onApplyPreset,
}: PresetGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<ThemeSettings | null>(null);

  const filteredPresets =
    activeCategory === "all"
      ? WEDDING_PRESETS
      : WEDDING_PRESETS.filter((p) => p.category === activeCategory);

  const handleApplyPreset = (preset: WeddingPreset) => {
    // Store current theme for undo
    setPreviousTheme({ ...theme });
    setAppliedPreset(preset.id);
    setShowUndo(true);

    // Apply the preset
    onApplyPreset(preset);

    // Hide undo after 5 seconds
    setTimeout(() => setShowUndo(false), 5000);
  };

  const handleUndo = () => {
    if (previousTheme) {
      onChange(previousTheme);
      setAppliedPreset(null);
      setShowUndo(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Undo toast */}
      {showUndo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl">
          <Check className="h-4 w-4 text-green-400" />
          <span className="text-sm">Preset applied</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? "bg-violet-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredPresets.map((preset) => {
          const isApplied = appliedPreset === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                isApplied
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Color preview header */}
              <div
                className="h-20 relative"
                style={{
                  background: `linear-gradient(135deg, ${preset.colors.primaryColor} 0%, ${preset.colors.secondaryColor} 100%)`,
                }}
              >
                {/* Swatch overlay */}
                <div className="absolute bottom-2 left-2 flex -space-x-1">
                  {[
                    preset.colors.primaryColor,
                    preset.colors.secondaryColor,
                    preset.colors.accentColor,
                    preset.colors.backgroundColor,
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Applied checkmark */}
                {isApplied && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4 text-violet-500" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded transition-opacity">
                    Apply
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-white">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {preset.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{preset.category}</p>

                {/* Font preview */}
                {preset.fonts && (
                  <p
                    className="text-xs text-gray-400 mt-1 truncate"
                    style={{ fontFamily: `"${preset.fonts.heading}", cursive` }}
                  >
                    {preset.fonts.heading}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredPresets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No presets found in this category</p>
        </div>
      )}

      {/* Tip */}
      <div className="p-3 bg-violet-50 rounded-lg">
        <p className="text-xs text-violet-700">
          <strong>Tip:</strong> Presets give you a starting point. After applying,
          fine-tune colors and fonts in the other tabs.
        </p>
      </div>
    </div>
  );
}
