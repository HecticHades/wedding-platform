"use client";

import { useState } from "react";
import { Check, Palette, Clock, Sparkles } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { COLOR_PALETTES } from "@/lib/content/theme-utils";

interface ColorPalettePanelProps {
  theme: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
}

const COLOR_FIELDS = [
  { key: "primaryColor", label: "Primary", description: "Main brand color" },
  { key: "secondaryColor", label: "Secondary", description: "Accent highlights" },
  { key: "backgroundColor", label: "Background", description: "Page background" },
  { key: "textColor", label: "Text", description: "Body text color" },
  { key: "accentColor", label: "Accent", description: "Buttons & links" },
] as const;

export function ColorPalettePanel({ theme, onChange }: ColorPalettePanelProps) {
  const [activeColor, setActiveColor] = useState<keyof ThemeSettings | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const handleColorChange = (key: keyof ThemeSettings, color: string) => {
    onChange({ [key]: color });

    // Add to recent colors (max 8, no duplicates)
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  const applyPalette = (paletteId: string) => {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (palette) {
      onChange(palette.colors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset palettes section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-medium text-gray-900">Quick Palettes</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PALETTES.slice(0, 6).map((palette) => (
            <button
              key={palette.id}
              onClick={() => applyPalette(palette.id)}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left group"
            >
              <div className="flex -space-x-1">
                {[
                  palette.colors.primaryColor,
                  palette.colors.secondaryColor,
                  palette.colors.accentColor,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-violet-700 truncate">
                {palette.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual color pickers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-medium text-gray-900">Customize Colors</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COLOR_FIELDS.map((field) => {
            const color = theme[field.key] as string;
            const isActive = activeColor === field.key;

            return (
              <div key={field.key} className="relative">
                <button
                  onClick={() => setActiveColor(isActive ? null : field.key)}
                  className={`w-full p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-violet-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded-lg mb-2 shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {field.label}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {color.toUpperCase()}
                  </p>
                </button>

                {/* Expanded color picker */}
                {isActive && (
                  <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200">
                    <HexColorPicker
                      color={color}
                      onChange={(newColor) => handleColorChange(field.key, newColor)}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                          handleColorChange(field.key, e.target.value);
                        }
                      }}
                      className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center font-mono"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <h4 className="text-xs font-medium text-gray-500">Recent Colors</h4>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {recentColors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => {
                  if (activeColor) {
                    handleColorChange(activeColor, color);
                  }
                }}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
                disabled={!activeColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Color harmony suggestions */}
      {activeColor && (
        <div className="p-3 bg-violet-50 rounded-lg">
          <p className="text-xs text-violet-700">
            <strong>Tip:</strong> Click a color swatch above to edit, then use the picker or enter a hex code.
          </p>
        </div>
      )}
    </div>
  );
}
