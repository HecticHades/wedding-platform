"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import type { ThemeSettings, WeddingPreset } from "@/lib/content/theme-utils";
import { ThemeStudioHeader } from "./ThemeStudioHeader";
import { ThemeStudioControls } from "./ThemeStudioControls";
import { EnhancedLivePreview } from "./preview/EnhancedLivePreview";
import { updateTheme } from "@/app/(platform)/dashboard/theme/actions";

interface ThemeStudioProps {
  initialTheme: ThemeSettings;
  siteUrl: string;
  partner1Name?: string;
  partner2Name?: string;
}

export function ThemeStudio({
  initialTheme,
  siteUrl,
  partner1Name,
  partner2Name,
}: ThemeStudioProps) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme);
  const [savedTheme, setSavedTheme] = useState<ThemeSettings>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if theme has changed from saved state
  const hasChanges = useMemo(() => {
    return JSON.stringify(theme) !== JSON.stringify(savedTheme);
  }, [theme, savedTheme]);

  // Update theme with partial changes
  const handleChange = useCallback((updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  // Apply a complete preset
  const handleApplyPreset = useCallback((preset: WeddingPreset) => {
    setTheme((prev) => ({
      ...prev,
      ...preset.colors,
      ...(preset.fonts && {
        fontFamily: preset.fonts.body,
        headingFont: preset.fonts.heading,
      }),
      ...(preset.style && {
        borderRadius: preset.style.borderRadius,
        shadowIntensity: preset.style.shadowIntensity,
        buttonStyle: preset.style.buttonStyle,
      }),
    }));
    setError(null);
  }, []);

  // Save theme to database
  const handleSave = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await updateTheme(theme);
      if (result.success) {
        setSavedTheme(theme);
        setLastSaved(new Date());
      } else {
        setError(result.error);
      }
    });
  }, [theme]);

  // Reset to saved theme
  const handleReset = useCallback(() => {
    setTheme(savedTheme);
    setError(null);
  }, [savedTheme]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
      {/* Header */}
      <ThemeStudioHeader
        onSave={handleSave}
        onReset={handleReset}
        isSaving={isPending}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        siteUrl={siteUrl}
      />

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Controls panel */}
        <div className="w-[420px] flex-shrink-0">
          <ThemeStudioControls
            theme={theme}
            initialTheme={initialTheme}
            onChange={handleChange}
            onApplyPreset={handleApplyPreset}
          />
        </div>

        {/* Live preview */}
        <div className="flex-1 min-w-0">
          <EnhancedLivePreview
            theme={theme}
            partner1Name={partner1Name}
            partner2Name={partner2Name}
          />
        </div>
      </div>
    </div>
  );
}
