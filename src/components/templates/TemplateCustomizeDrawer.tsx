"use client";

import { useState } from "react";
import { X, RotateCcw, ChevronDown } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { TemplateMiniPreview } from "./TemplateMiniPreview";

interface TemplateCustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeSettings;
  onThemeChange: (theme: ThemeSettings) => void;
  onSave: () => void;
}

const presetPalettes = [
  {
    name: "Classic",
    colors: {
      primaryColor: "#2c3e50",
      secondaryColor: "#7f8c8d",
      accentColor: "#c0392b",
      backgroundColor: "#ffffff",
      textColor: "#2c3e50",
    },
  },
  {
    name: "Romantic",
    colors: {
      primaryColor: "#c4a4a4",
      secondaryColor: "#9caa9c",
      accentColor: "#c9a962",
      backgroundColor: "#faf8f5",
      textColor: "#3d3936",
    },
  },
  {
    name: "Modern",
    colors: {
      primaryColor: "#1a1a1a",
      secondaryColor: "#555555",
      accentColor: "#e63946",
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
    },
  },
  {
    name: "Garden",
    colors: {
      primaryColor: "#3d5a45",
      secondaryColor: "#8ba888",
      accentColor: "#d4a373",
      backgroundColor: "#f5f5f0",
      textColor: "#3d3d3d",
    },
  },
  {
    name: "Ocean",
    colors: {
      primaryColor: "#264653",
      secondaryColor: "#2a9d8f",
      accentColor: "#e9c46a",
      backgroundColor: "#f8f9fa",
      textColor: "#264653",
    },
  },
  {
    name: "Sunset",
    colors: {
      primaryColor: "#8b4513",
      secondaryColor: "#cd853f",
      accentColor: "#ff6b6b",
      backgroundColor: "#fff8f0",
      textColor: "#4a3728",
    },
  },
];

const fontOptions = {
  heading: [
    "Playfair Display",
    "Cormorant Garamond",
    "Great Vibes",
    "Merriweather",
    "Lora",
    "Crimson Text",
  ],
  body: ["Inter", "Open Sans", "Lato", "Roboto", "Source Sans Pro", "Nunito"],
};

export function TemplateCustomizeDrawer({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  onSave,
}: TemplateCustomizeDrawerProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "fonts">("colors");

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    onThemeChange({ ...theme, [key]: value });
  };

  const applyPreset = (preset: typeof presetPalettes[0]) => {
    onThemeChange({
      ...theme,
      ...preset.colors,
    });
  };

  const resetToDefault = () => {
    // Reset to first preset as default
    applyPreset(presetPalettes[0]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customize Theme</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("colors")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "colors"
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Colors
          </button>
          <button
            onClick={() => setActiveTab("fonts")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "fonts"
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Fonts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "colors" && (
            <div className="space-y-6">
              {/* Preset palettes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Quick Palettes
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {presetPalettes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                    >
                      <div className="flex -space-x-1 mb-2">
                        {Object.values(preset.colors)
                          .slice(0, 4)
                          .map((color, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                      </div>
                      <p className="text-xs font-medium text-gray-600">
                        {preset.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual color pickers */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Custom Colors
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "primaryColor", label: "Primary" },
                    { key: "secondaryColor", label: "Secondary" },
                    { key: "accentColor", label: "Accent" },
                    { key: "backgroundColor", label: "Background" },
                    { key: "textColor", label: "Text" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-24 text-sm text-gray-600">
                        {label}
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={theme[key as keyof ThemeSettings] as string}
                          onChange={(e) =>
                            handleColorChange(key as keyof ThemeSettings, e.target.value)
                          }
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme[key as keyof ThemeSettings] as string}
                          onChange={(e) =>
                            handleColorChange(key as keyof ThemeSettings, e.target.value)
                          }
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "fonts" && (
            <div className="space-y-6">
              {/* Heading font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Font
                </label>
                <div className="relative">
                  <select
                    value={theme.headingFont}
                    onChange={(e) =>
                      handleColorChange("headingFont" as keyof ThemeSettings, e.target.value)
                    }
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    style={{ fontFamily: theme.headingFont }}
                  >
                    {fontOptions.heading.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p
                  className="mt-2 text-lg"
                  style={{ fontFamily: theme.headingFont }}
                >
                  Preview: Emma & James
                </p>
              </div>

              {/* Body font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Font
                </label>
                <div className="relative">
                  <select
                    value={theme.bodyFont}
                    onChange={(e) =>
                      handleColorChange("bodyFont" as keyof ThemeSettings, e.target.value)
                    }
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    style={{ fontFamily: theme.bodyFont }}
                  >
                    {fontOptions.body.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p
                  className="mt-2 text-sm"
                  style={{ fontFamily: theme.bodyFont }}
                >
                  Preview: Join us for a celebration of love.
                </p>
              </div>
            </div>
          )}

          {/* Live preview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <TemplateMiniPreview theme={theme} scale={0.5} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
