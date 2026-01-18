"use client";

import { generateCSSVariablesObject } from "@/lib/content/theme-utils";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ThemeProviderProps {
  theme: ThemeSettings;
  children: React.ReactNode;
}

/**
 * ThemeProvider injects CSS variables from theme settings into a container div.
 * All children will inherit these CSS variables for theming.
 *
 * Uses a wrapper div that spans full height to ensure CSS variables cascade
 * to all children. The min-h-screen ensures the theme container covers the viewport.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVariables = generateCSSVariablesObject(theme);

  return (
    <div
      style={cssVariables as React.CSSProperties}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
