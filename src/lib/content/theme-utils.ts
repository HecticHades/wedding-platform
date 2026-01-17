/**
 * Theme utilities for generating CSS variables and managing theme settings
 */

/**
 * Re-export ThemeSettings type for convenience
 */
export type ThemeSettings = PrismaJson.ThemeSettings;

/**
 * Default theme with elegant wedding colors
 */
export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#8B5CF6",
  secondaryColor: "#EC4899",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  accentColor: "#10B981",
  fontFamily: "Playfair Display",
  headingFont: "Great Vibes",
};

/**
 * Generate CSS variable declarations from theme settings
 * Returns a string that can be used in a style attribute or style tag
 */
export function generateCSSVariables(theme: ThemeSettings): string {
  return `
    --wedding-primary: ${theme.primaryColor};
    --wedding-secondary: ${theme.secondaryColor};
    --wedding-background: ${theme.backgroundColor};
    --wedding-text: ${theme.textColor};
    --wedding-accent: ${theme.accentColor};
    --wedding-font-body: "${theme.fontFamily}", serif;
    --wedding-font-heading: "${theme.headingFont}", cursive;
  `.trim();
}

/**
 * Generate CSS variable declarations as an object for inline styles
 * Can be spread into a style prop
 */
export function generateCSSVariablesObject(
  theme: ThemeSettings
): Record<string, string> {
  return {
    "--wedding-primary": theme.primaryColor,
    "--wedding-secondary": theme.secondaryColor,
    "--wedding-background": theme.backgroundColor,
    "--wedding-text": theme.textColor,
    "--wedding-accent": theme.accentColor,
    "--wedding-font-body": `"${theme.fontFamily}", serif`,
    "--wedding-font-heading": `"${theme.headingFont}", cursive`,
  } as Record<string, string>;
}

/**
 * Font options available for wedding themes
 * These are Google Fonts that work well for weddings
 */
export const FONT_OPTIONS = [
  // Elegant serif fonts for body text
  { value: "Playfair Display", label: "Playfair Display", category: "body" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", category: "body" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "body" },
  { value: "Merriweather", label: "Merriweather", category: "body" },
  { value: "Lora", label: "Lora", category: "body" },
  { value: "EB Garamond", label: "EB Garamond", category: "body" },

  // Modern sans-serif fonts for body text
  { value: "Inter", label: "Inter", category: "body" },
  { value: "Montserrat", label: "Montserrat", category: "body" },
  { value: "Raleway", label: "Raleway", category: "body" },
  { value: "Open Sans", label: "Open Sans", category: "body" },

  // Script/cursive fonts for headings
  { value: "Great Vibes", label: "Great Vibes", category: "heading" },
  { value: "Sacramento", label: "Sacramento", category: "heading" },
  { value: "Tangerine", label: "Tangerine", category: "heading" },
  { value: "Alex Brush", label: "Alex Brush", category: "heading" },
  { value: "Parisienne", label: "Parisienne", category: "heading" },
  { value: "Dancing Script", label: "Dancing Script", category: "heading" },
  { value: "Allura", label: "Allura", category: "heading" },

  // Display fonts for headings
  { value: "Cinzel", label: "Cinzel", category: "heading" },
  { value: "Josefin Sans", label: "Josefin Sans", category: "heading" },
  { value: "Amatic SC", label: "Amatic SC", category: "heading" },
] as const;

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: "body" | "heading") {
  return FONT_OPTIONS.filter((font) => font.category === category);
}

/**
 * Preset color palettes for quick theme selection
 */
export const COLOR_PALETTES = [
  {
    id: "classic-purple",
    name: "Classic Purple",
    colors: {
      primaryColor: "#8B5CF6",
      secondaryColor: "#EC4899",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      accentColor: "#10B981",
    },
  },
  {
    id: "blush-gold",
    name: "Blush & Gold",
    colors: {
      primaryColor: "#D4A574",
      secondaryColor: "#F5E1DA",
      backgroundColor: "#FFFBF7",
      textColor: "#4A3728",
      accentColor: "#C9A962",
    },
  },
  {
    id: "navy-coral",
    name: "Navy & Coral",
    colors: {
      primaryColor: "#1E3A5F",
      secondaryColor: "#FF6B6B",
      backgroundColor: "#FFFFFF",
      textColor: "#2C3E50",
      accentColor: "#48C9B0",
    },
  },
  {
    id: "sage-terracotta",
    name: "Sage & Terracotta",
    colors: {
      primaryColor: "#7D9B76",
      secondaryColor: "#C67D5E",
      backgroundColor: "#FAF8F5",
      textColor: "#3D3D3D",
      accentColor: "#E8B87D",
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    colors: {
      primaryColor: "#000000",
      secondaryColor: "#6B7280",
      backgroundColor: "#FAFAFA",
      textColor: "#111827",
      accentColor: "#3B82F6",
    },
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    colors: {
      primaryColor: "#C48B9F",
      secondaryColor: "#E5C1CD",
      backgroundColor: "#FFF9FA",
      textColor: "#4A3B40",
      accentColor: "#9DB4AB",
    },
  },
] as const;

/**
 * Get a color palette by ID
 */
export function getColorPalette(id: string) {
  return COLOR_PALETTES.find((palette) => palette.id === id);
}

/**
 * Merge partial theme settings with defaults
 */
export function mergeWithDefaults(
  partial: Partial<ThemeSettings>
): ThemeSettings {
  return {
    ...DEFAULT_THEME,
    ...partial,
  };
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Convert hex to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance for contrast checking
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if text color has sufficient contrast with background
 * Returns true if contrast ratio is >= 4.5:1 (WCAG AA)
 */
export function hasGoodContrast(textColor: string, backgroundColor: string): boolean {
  const textLuminance = getLuminance(textColor);
  const bgLuminance = getLuminance(backgroundColor);

  const lighter = Math.max(textLuminance, bgLuminance);
  const darker = Math.min(textLuminance, bgLuminance);

  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  return contrastRatio >= 4.5;
}
