"use client";

import { generateCSSVariables } from "@/lib/content/theme-utils";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ThemeProviderProps {
  theme: ThemeSettings;
  children: React.ReactNode;
}

/**
 * ThemeProvider injects CSS variables from theme settings into a container div.
 * All children will inherit these CSS variables for theming.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVariables = generateCSSVariables(theme);

  return (
    <div
      style={{ cssText: cssVariables } as React.CSSProperties}
      className="contents"
    >
      {children}
    </div>
  );
}
