"use client";

import { useState } from "react";
import { Type, Check } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { FONT_OPTIONS } from "@/lib/content/theme-utils";

interface TypographyPanelProps {
  theme: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
}

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Compact", description: "Smaller text, more content" },
  { value: "medium", label: "Normal", description: "Default size" },
  { value: "large", label: "Spacious", description: "Larger, easier to read" },
] as const;

const LINE_HEIGHT_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "relaxed", label: "Relaxed" },
] as const;

type FontCategory = "body" | "heading" | "all";

export function TypographyPanel({ theme, onChange }: TypographyPanelProps) {
  const [headingFilter, setHeadingFilter] = useState<FontCategory>("heading");
  const [bodyFilter, setBodyFilter] = useState<FontCategory>("body");

  const getFilteredFonts = (filter: FontCategory) => {
    if (filter === "all") return FONT_OPTIONS;
    return FONT_OPTIONS.filter((f) => f.category === filter);
  };

  const bodyFonts = getFilteredFonts(bodyFilter);
  const headingFonts = getFilteredFonts(headingFilter);

  // Categorize fonts for display
  const serifFonts = FONT_OPTIONS.filter(
    (f) => f.category === "body" && !["Inter", "Montserrat", "Raleway", "Open Sans"].includes(f.value)
  );
  const sansFonts = FONT_OPTIONS.filter(
    (f) => ["Inter", "Montserrat", "Raleway", "Open Sans"].includes(f.value)
  );
  const scriptFonts = FONT_OPTIONS.filter((f) => f.category === "heading");

  return (
    <div className="space-y-6">
      {/* Heading Font Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-medium text-gray-900">Heading Font</h3>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { value: "heading", label: "Script" },
              { value: "body", label: "Serif" },
              { value: "all", label: "All" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHeadingFilter(opt.value as FontCategory)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  headingFilter === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {headingFonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onChange({ headingFont: font.value })}
              className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                theme.headingFont === font.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {theme.headingFont === font.value && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="h-4 w-4 text-violet-500" />
                </div>
              )}
              <p
                className="text-2xl mb-1 truncate"
                style={{ fontFamily: `"${font.value}", cursive` }}
              >
                Aa
              </p>
              <p className="text-xs font-medium text-gray-700 truncate">
                {font.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Body Font Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-medium text-gray-900">Body Font</h3>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { value: "body", label: "All" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBodyFilter(opt.value as FontCategory)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  bodyFilter === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {bodyFonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onChange({ fontFamily: font.value })}
              className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                theme.fontFamily === font.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {theme.fontFamily === font.value && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="h-4 w-4 text-violet-500" />
                </div>
              )}
              <p
                className="text-xl mb-1"
                style={{ fontFamily: `"${font.value}", serif` }}
              >
                Aa
              </p>
              <p className="text-xs font-medium text-gray-700 truncate">
                {font.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Scale */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Font Size Scale</h3>
        <div className="flex gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ fontSize: option.value })}
              className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                (theme.fontSize || "medium") === option.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{option.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Line Spacing</h3>
        <div className="flex gap-2">
          {LINE_HEIGHT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ lineHeight: option.value })}
              className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                (theme.lineHeight || "normal") === option.value
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Preview
        </h4>
        <div
          className="p-4 bg-white rounded-lg border border-gray-200"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <h2
            className="text-2xl mb-2"
            style={{
              fontFamily: `"${theme.headingFont}", cursive`,
              color: theme.primaryColor,
            }}
          >
            Emma & James
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: `"${theme.fontFamily}", serif`,
              color: theme.textColor,
              lineHeight:
                theme.lineHeight === "compact"
                  ? "1.4"
                  : theme.lineHeight === "relaxed"
                  ? "1.8"
                  : "1.6",
            }}
          >
            We are so excited to celebrate our special day with you. Please join us
            for an unforgettable evening of love, laughter, and happily ever after.
          </p>
        </div>
      </div>
    </div>
  );
}
