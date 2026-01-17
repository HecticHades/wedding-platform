"use client";

import { getFontsByCategory } from "@/lib/content/theme-utils";

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  category: "body" | "heading";
}

/**
 * FontSelector component for choosing fonts from predefined options.
 * Displays font names in their actual font style for preview.
 */
export function FontSelector({
  label,
  value,
  onChange,
  category,
}: FontSelectorProps) {
  const fonts = getFontsByCategory(category);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      >
        {fonts.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: `"${font.value}", ${category === "body" ? "serif" : "cursive"}` }}
          >
            {font.label}
          </option>
        ))}
      </select>
    </div>
  );
}
