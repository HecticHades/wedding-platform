"use client";

import { createContext, useContext } from "react";
import { generateCSSVariablesObject } from "@/lib/content/theme-utils";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ThemeContextValue {
  buttonStyle: "solid" | "outline" | "soft";
  dividerStyle: "none" | "line" | "ornament" | "flourish";
  borderRadius: "none" | "subtle" | "rounded";
  shadowIntensity: "none" | "subtle" | "medium" | "dramatic";
}

const ThemeContext = createContext<ThemeContextValue>({
  buttonStyle: "solid",
  dividerStyle: "line",
  borderRadius: "subtle",
  shadowIntensity: "subtle",
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

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
 *
 * Also provides a React context with style settings for components that need
 * to render differently based on the theme (e.g., buttonStyle, dividerStyle).
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVariables = generateCSSVariablesObject(theme);

  const contextValue: ThemeContextValue = {
    buttonStyle: theme.buttonStyle || "solid",
    dividerStyle: theme.dividerStyle || "line",
    borderRadius: theme.borderRadius || "subtle",
    shadowIntensity: theme.shadowIntensity || "subtle",
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        style={cssVariables as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
