"use client";

import { useState, useTransition } from "react";
import { ColorPicker } from "@/components/theme/ColorPicker";
import { FontSelector } from "@/components/theme/FontSelector";
import { LivePreview } from "@/components/theme/LivePreview";
import { updateTheme } from "./actions";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ThemeEditorProps {
  initialTheme: ThemeSettings;
}

export function ThemeEditor({ initialTheme }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateColor = (key: keyof ThemeSettings, color: string) => {
    setTheme((prev) => ({ ...prev, [key]: color }));
  };

  const updateFont = (key: "fontFamily" | "headingFont", font: string) => {
    setTheme((prev) => ({ ...prev, [key]: font }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateTheme(theme);
      if (result.success) {
        setMessage({ type: "success", text: "Theme saved successfully!" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-8">
        {/* Color Pickers */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ColorPicker
              label="Primary Color"
              value={theme.primaryColor}
              onChange={(color) => updateColor("primaryColor", color)}
            />
            <ColorPicker
              label="Secondary Color"
              value={theme.secondaryColor}
              onChange={(color) => updateColor("secondaryColor", color)}
            />
            <ColorPicker
              label="Background Color"
              value={theme.backgroundColor}
              onChange={(color) => updateColor("backgroundColor", color)}
            />
            <ColorPicker
              label="Text Color"
              value={theme.textColor}
              onChange={(color) => updateColor("textColor", color)}
            />
            <ColorPicker
              label="Accent Color"
              value={theme.accentColor}
              onChange={(color) => updateColor("accentColor", color)}
            />
          </div>
        </section>

        {/* Font Selectors */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Fonts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FontSelector
              label="Body Font"
              value={theme.fontFamily}
              onChange={(font) => updateFont("fontFamily", font)}
              category="body"
            />
            <FontSelector
              label="Heading Font"
              value={theme.headingFont}
              onChange={(font) => updateFont("headingFont", font)}
              category="heading"
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Saving..." : "Save Theme"}
          </button>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
        <LivePreview theme={theme} />
        <p className="mt-4 text-sm text-gray-500">
          Changes appear instantly in the preview. Click &quot;Save Theme&quot; to apply
          them to your live website.
        </p>
      </div>
    </div>
  );
}
