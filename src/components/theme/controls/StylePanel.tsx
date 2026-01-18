"use client";

import {
  Square,
  Circle,
  RectangleHorizontal,
  Sparkles,
  Minus,
  Layers,
} from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface StylePanelProps {
  theme: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
}

const BORDER_RADIUS_OPTIONS = [
  { value: "none", label: "None", icon: Square },
  { value: "subtle", label: "Subtle", icon: RectangleHorizontal },
  { value: "rounded", label: "Rounded", icon: RectangleHorizontal },
  { value: "pill", label: "Pill", icon: Circle },
] as const;

const SHADOW_OPTIONS = [
  { value: "none", label: "None", preview: "shadow-none" },
  { value: "subtle", label: "Subtle", preview: "shadow-sm" },
  { value: "medium", label: "Medium", preview: "shadow-md" },
  { value: "dramatic", label: "Dramatic", preview: "shadow-xl" },
] as const;

const SECTION_STYLE_OPTIONS = [
  { value: "solid", label: "Solid", description: "Clean, single color backgrounds" },
  { value: "gradient", label: "Gradient", description: "Subtle color transitions" },
  { value: "pattern", label: "Pattern", description: "Decorative background textures" },
] as const;

const BUTTON_STYLE_OPTIONS = [
  { value: "solid", label: "Solid", description: "Filled buttons" },
  { value: "outline", label: "Outline", description: "Bordered, transparent" },
  { value: "soft", label: "Soft", description: "Tinted background" },
] as const;

const DIVIDER_STYLE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "line", label: "Line" },
  { value: "ornament", label: "Ornament" },
  { value: "flourish", label: "Flourish" },
] as const;

export function StylePanel({ theme, onChange }: StylePanelProps) {
  return (
    <div className="space-y-6">
      {/* Border Radius */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Corner Radius</h3>
        <div className="grid grid-cols-4 gap-2">
          {BORDER_RADIUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = (theme.borderRadius || "subtle") === option.value;
            const radiusClass =
              option.value === "none"
                ? "rounded-none"
                : option.value === "subtle"
                ? "rounded"
                : option.value === "rounded"
                ? "rounded-xl"
                : "rounded-full";

            return (
              <button
                key={option.value}
                onClick={() => onChange({ borderRadius: option.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto mb-2 bg-violet-200 ${radiusClass}`}
                />
                <p className="text-xs font-medium text-gray-700">{option.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shadow Intensity */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Shadow Intensity</h3>
        <div className="grid grid-cols-4 gap-2">
          {SHADOW_OPTIONS.map((option) => {
            const isSelected = (theme.shadowIntensity || "subtle") === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onChange({ shadowIntensity: option.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-6 mx-auto mb-2 bg-white rounded ${option.preview}`}
                />
                <p className="text-xs font-medium text-gray-700">{option.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Style */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Section Backgrounds</h3>
        <div className="grid grid-cols-3 gap-2">
          {SECTION_STYLE_OPTIONS.map((option) => {
            const isSelected = (theme.sectionStyle || "solid") === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onChange({ sectionStyle: option.value })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Layers className="h-4 w-4 text-violet-500 mb-1" />
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button Style */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Button Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_STYLE_OPTIONS.map((option) => {
            const isSelected = (theme.buttonStyle || "solid") === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onChange({ buttonStyle: option.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {/* Button preview */}
                <div className="mb-2">
                  {option.value === "solid" && (
                    <div
                      className="px-3 py-1 text-xs font-medium text-white rounded-md mx-auto w-fit"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      RSVP
                    </div>
                  )}
                  {option.value === "outline" && (
                    <div
                      className="px-3 py-1 text-xs font-medium rounded-md border-2 mx-auto w-fit"
                      style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                    >
                      RSVP
                    </div>
                  )}
                  {option.value === "soft" && (
                    <div
                      className="px-3 py-1 text-xs font-medium rounded-md mx-auto w-fit"
                      style={{
                        backgroundColor: `${theme.primaryColor}20`,
                        color: theme.primaryColor,
                      }}
                    >
                      RSVP
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider Style */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Section Dividers</h3>
        <div className="grid grid-cols-4 gap-2">
          {DIVIDER_STYLE_OPTIONS.map((option) => {
            const isSelected = (theme.dividerStyle || "line") === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onChange({ dividerStyle: option.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {/* Divider preview */}
                <div className="h-6 flex items-center justify-center mb-2">
                  {option.value === "none" && (
                    <div className="w-8 h-px bg-gray-200" />
                  )}
                  {option.value === "line" && (
                    <div className="w-full h-px bg-gray-400" />
                  )}
                  {option.value === "ornament" && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-px bg-gray-400" />
                      <div className="w-2 h-2 rotate-45 border border-gray-400" />
                      <div className="w-3 h-px bg-gray-400" />
                    </div>
                  )}
                  {option.value === "flourish" && (
                    <div className="text-gray-400 text-lg">~</div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700">{option.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Preview */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Style Preview
        </h4>
        <div
          className="p-4 bg-white border border-gray-200"
          style={{
            borderRadius:
              theme.borderRadius === "none"
                ? "0"
                : theme.borderRadius === "subtle"
                ? "0.375rem"
                : theme.borderRadius === "pill"
                ? "9999px"
                : "0.75rem",
            boxShadow:
              theme.shadowIntensity === "none"
                ? "none"
                : theme.shadowIntensity === "subtle"
                ? "0 1px 2px rgba(0,0,0,0.05)"
                : theme.shadowIntensity === "dramatic"
                ? "0 25px 50px -12px rgba(0,0,0,0.25)"
                : "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <p className="text-sm text-gray-700 mb-3">
            Your wedding cards and sections will use these styles.
          </p>
          <button
            className="px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor:
                theme.buttonStyle === "outline" || theme.buttonStyle === "soft"
                  ? theme.buttonStyle === "soft"
                    ? `${theme.primaryColor}20`
                    : "transparent"
                  : theme.primaryColor,
              color:
                theme.buttonStyle === "solid"
                  ? "white"
                  : theme.primaryColor,
              border:
                theme.buttonStyle === "outline"
                  ? `2px solid ${theme.primaryColor}`
                  : "none",
              borderRadius:
                theme.borderRadius === "none"
                  ? "0"
                  : theme.borderRadius === "pill"
                  ? "9999px"
                  : "0.5rem",
            }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );
}
