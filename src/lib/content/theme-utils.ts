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
 * Border radius mapping for theme styles
 */
const RADIUS_MAP: Record<string, string> = {
  none: "0",
  subtle: "0.375rem",
  rounded: "0.75rem",
  pill: "9999px",
};

/**
 * Shadow mapping for theme styles
 */
const SHADOW_MAP: Record<string, string> = {
  none: "none",
  subtle: "0 1px 2px rgba(0,0,0,0.05)",
  medium: "0 4px 6px -1px rgba(0,0,0,0.1)",
  dramatic: "0 25px 50px -12px rgba(0,0,0,0.25)",
};

/**
 * Font size scale mapping for responsive typography
 */
const FONT_SIZE_MAP: Record<string, { base: string; heading: string; display: string }> = {
  small: { base: "0.875rem", heading: "1.5rem", display: "2.5rem" },
  medium: { base: "1rem", heading: "2rem", display: "3.5rem" },
  large: { base: "1.125rem", heading: "2.5rem", display: "4.5rem" },
};

/**
 * Generate CSS variable declarations from theme settings
 * Returns a string that can be used in a style attribute or style tag
 * Uses next/font CSS variables for proper font loading
 */
export function generateCSSVariables(theme: ThemeSettings): string {
  const bodyFont = FONT_CSS_VAR_MAP[theme.fontFamily] || `"${theme.fontFamily}"`;
  const headingFont = FONT_CSS_VAR_MAP[theme.headingFont] || `"${theme.headingFont}"`;

  // Extended style options
  const radius = RADIUS_MAP[theme.borderRadius || "subtle"];
  const shadow = SHADOW_MAP[theme.shadowIntensity || "subtle"];
  const buttonStyle = theme.buttonStyle || "solid";
  const dividerStyle = theme.dividerStyle || "line";
  const sectionStyle = theme.sectionStyle || "solid";
  const fontSizes = FONT_SIZE_MAP[theme.fontSize || "medium"];

  return `
    --wedding-primary: ${theme.primaryColor};
    --wedding-secondary: ${theme.secondaryColor};
    --wedding-background: ${theme.backgroundColor};
    --wedding-text: ${theme.textColor};
    --wedding-accent: ${theme.accentColor};
    --wedding-font-body: ${bodyFont}, serif;
    --wedding-font-heading: ${headingFont}, cursive;
    --wedding-radius: ${radius};
    --wedding-radius-sm: calc(${radius} * 0.67);
    --wedding-radius-lg: calc(${radius} * 1.33);
    --wedding-shadow: ${shadow};
    --wedding-button-style: ${buttonStyle};
    --wedding-divider-style: ${dividerStyle};
    --wedding-section-style: ${sectionStyle};
    --wedding-font-size-base: ${fontSizes.base};
    --wedding-font-size-heading: ${fontSizes.heading};
    --wedding-font-size-display: ${fontSizes.display};
  `.trim();
}

/**
 * Generate CSS variable declarations as an object for inline styles
 * Can be spread into a style prop
 * Uses next/font CSS variables for proper font loading
 */
export function generateCSSVariablesObject(
  theme: ThemeSettings
): Record<string, string> {
  const bodyFont = FONT_CSS_VAR_MAP[theme.fontFamily] || `"${theme.fontFamily}"`;
  const headingFont = FONT_CSS_VAR_MAP[theme.headingFont] || `"${theme.headingFont}"`;

  // Extended style options
  const radius = RADIUS_MAP[theme.borderRadius || "subtle"];
  const shadow = SHADOW_MAP[theme.shadowIntensity || "subtle"];
  const buttonStyle = theme.buttonStyle || "solid";
  const dividerStyle = theme.dividerStyle || "line";
  const sectionStyle = theme.sectionStyle || "solid";
  const fontSizes = FONT_SIZE_MAP[theme.fontSize || "medium"];

  return {
    "--wedding-primary": theme.primaryColor,
    "--wedding-secondary": theme.secondaryColor,
    "--wedding-background": theme.backgroundColor,
    "--wedding-text": theme.textColor,
    "--wedding-accent": theme.accentColor,
    "--wedding-font-body": `${bodyFont}, serif`,
    "--wedding-font-heading": `${headingFont}, cursive`,
    "--wedding-radius": radius,
    "--wedding-radius-sm": `calc(${radius} * 0.67)`,
    "--wedding-radius-lg": `calc(${radius} * 1.33)`,
    "--wedding-shadow": shadow,
    "--wedding-button-style": buttonStyle,
    "--wedding-divider-style": dividerStyle,
    "--wedding-section-style": sectionStyle,
    "--wedding-font-size-base": fontSizes.base,
    "--wedding-font-size-heading": fontSizes.heading,
    "--wedding-font-size-display": fontSizes.display,
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
 * Map font names to their CSS variable names from next/font
 * Used by generateCSSVariables to reference self-hosted fonts
 */
export const FONT_CSS_VAR_MAP: Record<string, string> = {
  // Body fonts
  "Playfair Display": "var(--font-playfair-display)",
  "Cormorant Garamond": "var(--font-cormorant-garamond)",
  "Libre Baskerville": "var(--font-libre-baskerville)",
  "Merriweather": "var(--font-merriweather)",
  "Lora": "var(--font-lora)",
  "EB Garamond": "var(--font-eb-garamond)",
  "Inter": "var(--font-inter)",
  "Montserrat": "var(--font-montserrat)",
  "Raleway": "var(--font-raleway)",
  "Open Sans": "var(--font-open-sans)",
  // Heading fonts
  "Great Vibes": "var(--font-great-vibes)",
  "Sacramento": "var(--font-sacramento)",
  "Tangerine": "var(--font-tangerine)",
  "Alex Brush": "var(--font-alex-brush)",
  "Parisienne": "var(--font-parisienne)",
  "Dancing Script": "var(--font-dancing-script)",
  "Allura": "var(--font-allura)",
  "Cinzel": "var(--font-cinzel)",
  "Josefin Sans": "var(--font-josefin-sans)",
  "Amatic SC": "var(--font-amatic-sc)",
};

/**
 * Get the CSS variable reference for a font name
 * Falls back to font name in quotes if not in map
 */
export function getFontCSSVar(fontName: string): string {
  return FONT_CSS_VAR_MAP[fontName] || `"${fontName}"`;
}

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
 * Wedding preset with complete theme configuration
 */
export interface WeddingPreset {
  id: string;
  name: string;
  category: "romantic" | "classic" | "modern" | "nature" | "seasonal";
  colors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  fonts?: {
    body: string;
    heading: string;
  };
  style?: {
    borderRadius?: "none" | "subtle" | "rounded" | "pill";
    shadowIntensity?: "none" | "subtle" | "medium" | "dramatic";
    buttonStyle?: "solid" | "outline" | "soft";
  };
}

/**
 * Expanded wedding presets organized by category
 */
export const WEDDING_PRESETS: WeddingPreset[] = [
  // Romantic
  {
    id: "blush-gold",
    name: "Blush & Gold",
    category: "romantic",
    colors: {
      primaryColor: "#D4A574",
      secondaryColor: "#F5E1DA",
      backgroundColor: "#FFFBF7",
      textColor: "#4A3728",
      accentColor: "#C9A962",
    },
    fonts: { body: "Cormorant Garamond", heading: "Great Vibes" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    category: "romantic",
    colors: {
      primaryColor: "#C48B9F",
      secondaryColor: "#E5C1CD",
      backgroundColor: "#FFF9FA",
      textColor: "#4A3B40",
      accentColor: "#9DB4AB",
    },
    fonts: { body: "Libre Baskerville", heading: "Parisienne" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "mauve-sage",
    name: "Mauve & Sage",
    category: "romantic",
    colors: {
      primaryColor: "#8B7B8B",
      secondaryColor: "#A8B5A0",
      backgroundColor: "#FAFAF8",
      textColor: "#3D3D3D",
      accentColor: "#D4A574",
    },
    fonts: { body: "Lora", heading: "Dancing Script" },
    style: { borderRadius: "subtle", shadowIntensity: "subtle" },
  },

  // Classic
  {
    id: "navy-gold",
    name: "Navy & Gold",
    category: "classic",
    colors: {
      primaryColor: "#1E3A5F",
      secondaryColor: "#C9A962",
      backgroundColor: "#FFFFFF",
      textColor: "#1A2E40",
      accentColor: "#8B7355",
    },
    fonts: { body: "EB Garamond", heading: "Cinzel" },
    style: { borderRadius: "subtle", shadowIntensity: "medium" },
  },
  {
    id: "timeless-bw",
    name: "Timeless Black & White",
    category: "classic",
    colors: {
      primaryColor: "#1A1A1A",
      secondaryColor: "#4A4A4A",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      accentColor: "#C9A962",
    },
    fonts: { body: "Playfair Display", heading: "Cinzel" },
    style: { borderRadius: "none", shadowIntensity: "subtle" },
  },
  {
    id: "burgundy-cream",
    name: "Burgundy & Cream",
    category: "classic",
    colors: {
      primaryColor: "#722F37",
      secondaryColor: "#8E4585",
      backgroundColor: "#FBF9F7",
      textColor: "#3D2628",
      accentColor: "#9B7E46",
    },
    fonts: { body: "Libre Baskerville", heading: "Allura" },
    style: { borderRadius: "subtle", shadowIntensity: "medium" },
  },

  // Modern
  {
    id: "terracotta-chic",
    name: "Terracotta Chic",
    category: "modern",
    colors: {
      primaryColor: "#C67D5E",
      secondaryColor: "#E8B87D",
      backgroundColor: "#FAF8F5",
      textColor: "#3D3D3D",
      accentColor: "#7D9B76",
    },
    fonts: { body: "Raleway", heading: "Josefin Sans" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    category: "modern",
    colors: {
      primaryColor: "#000000",
      secondaryColor: "#6B7280",
      backgroundColor: "#FAFAFA",
      textColor: "#111827",
      accentColor: "#3B82F6",
    },
    fonts: { body: "Inter", heading: "Montserrat" },
    style: { borderRadius: "subtle", shadowIntensity: "none" },
  },
  {
    id: "moody-dark",
    name: "Moody & Dark",
    category: "modern",
    colors: {
      primaryColor: "#2D2D2D",
      secondaryColor: "#4A4A4A",
      backgroundColor: "#1A1A1A",
      textColor: "#E5E5E5",
      accentColor: "#C9A962",
    },
    fonts: { body: "Open Sans", heading: "Cinzel" },
    style: { borderRadius: "none", shadowIntensity: "dramatic" },
  },

  // Nature
  {
    id: "garden-green",
    name: "Garden Green",
    category: "nature",
    colors: {
      primaryColor: "#3D5A45",
      secondaryColor: "#D4A373",
      backgroundColor: "#F8FAF5",
      textColor: "#2D3B30",
      accentColor: "#8FB174",
    },
    fonts: { body: "Cormorant Garamond", heading: "Dancing Script" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "coastal-blue",
    name: "Coastal Blue",
    category: "nature",
    colors: {
      primaryColor: "#1E3A5F",
      secondaryColor: "#2A9D8F",
      backgroundColor: "#FEFEFE",
      textColor: "#1A2E40",
      accentColor: "#E9C46A",
    },
    fonts: { body: "Raleway", heading: "Parisienne" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    category: "nature",
    colors: {
      primaryColor: "#D4A373",
      secondaryColor: "#E9C46A",
      backgroundColor: "#FFFBF5",
      textColor: "#4A3728",
      accentColor: "#7D9B76",
    },
    fonts: { body: "Merriweather", heading: "Sacramento" },
    style: { borderRadius: "rounded", shadowIntensity: "medium" },
  },

  // Seasonal
  {
    id: "spring-pastels",
    name: "Spring Pastels",
    category: "seasonal",
    colors: {
      primaryColor: "#E8B4BC",
      secondaryColor: "#A8D5BA",
      backgroundColor: "#FEFEFE",
      textColor: "#4A4A4A",
      accentColor: "#F7E7CE",
    },
    fonts: { body: "Lora", heading: "Dancing Script" },
    style: { borderRadius: "rounded", shadowIntensity: "subtle" },
  },
  {
    id: "autumn-harvest",
    name: "Autumn Harvest",
    category: "seasonal",
    colors: {
      primaryColor: "#92400E",
      secondaryColor: "#B45309",
      backgroundColor: "#FFFBEB",
      textColor: "#78350F",
      accentColor: "#65A30D",
    },
    fonts: { body: "Merriweather", heading: "Sacramento" },
    style: { borderRadius: "subtle", shadowIntensity: "medium" },
  },
  {
    id: "winter-elegance",
    name: "Winter Elegance",
    category: "seasonal",
    colors: {
      primaryColor: "#2C3E50",
      secondaryColor: "#85C1E9",
      backgroundColor: "#FAFCFE",
      textColor: "#2C3E50",
      accentColor: "#C0C0C0",
    },
    fonts: { body: "Open Sans", heading: "Alex Brush" },
    style: { borderRadius: "subtle", shadowIntensity: "subtle" },
  },
];

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

/**
 * Get section background style based on theme settings
 * Supports solid, gradient, and pattern styles
 */
export function getSectionBackgroundStyle(
  theme: ThemeSettings,
  variant: "primary" | "secondary" | "accent" | "base" = "base"
): React.CSSProperties {
  const sectionStyle = theme.sectionStyle || "solid";

  // Base colors for each variant
  const baseColors: Record<string, { bg: string; opacity: string }> = {
    base: { bg: theme.backgroundColor, opacity: "08" },
    primary: { bg: theme.primaryColor, opacity: "08" },
    secondary: { bg: theme.secondaryColor, opacity: "10" },
    accent: { bg: theme.accentColor, opacity: "08" },
  };

  const { bg, opacity } = baseColors[variant];

  switch (sectionStyle) {
    case "gradient":
      if (variant === "base") {
        return { backgroundColor: theme.backgroundColor };
      }
      return {
        background: `linear-gradient(135deg, ${bg}${opacity} 0%, ${theme.backgroundColor} 100%)`,
      };
    case "pattern":
      if (variant === "base") {
        return { backgroundColor: theme.backgroundColor };
      }
      // Subtle dot pattern using CSS
      return {
        backgroundColor: variant === "base" ? theme.backgroundColor : `${bg}${opacity}`,
        backgroundImage: `radial-gradient(${bg}15 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    case "solid":
    default:
      return {
        backgroundColor: variant === "base" ? theme.backgroundColor : `${bg}${opacity}`,
      };
  }
}

/**
 * Get button style based on theme buttonStyle setting
 */
export function getButtonStyle(
  theme: ThemeSettings,
  variant: "primary" | "secondary" | "accent" = "primary"
): React.CSSProperties {
  const buttonStyle = theme.buttonStyle || "solid";
  const radius = RADIUS_MAP[theme.borderRadius || "subtle"];
  const shadow = SHADOW_MAP[theme.shadowIntensity || "subtle"];

  const colors: Record<string, string> = {
    primary: theme.primaryColor,
    secondary: theme.secondaryColor,
    accent: theme.accentColor,
  };

  const color = colors[variant];

  switch (buttonStyle) {
    case "outline":
      return {
        backgroundColor: "transparent",
        color: color,
        border: `2px solid ${color}`,
        borderRadius: radius,
      };
    case "soft":
      return {
        backgroundColor: `${color}20`,
        color: color,
        border: "none",
        borderRadius: radius,
      };
    case "solid":
    default:
      return {
        backgroundColor: color,
        color: "#ffffff",
        border: "none",
        borderRadius: radius,
        boxShadow: shadow,
      };
  }
}

/**
 * Get card style with shadow from theme
 */
export function getCardStyle(theme: ThemeSettings): React.CSSProperties {
  const radius = RADIUS_MAP[theme.borderRadius || "subtle"];
  const shadow = SHADOW_MAP[theme.shadowIntensity || "subtle"];

  return {
    borderRadius: radius,
    boxShadow: shadow,
  };
}

/**
 * Get hero overlay style based on theme settings
 */
export function getOverlayStyle(theme: ThemeSettings): React.CSSProperties | null {
  const heroImage = theme.heroImage;
  if (!heroImage || heroImage.overlay === "none") return null;

  const opacity = heroImage.overlayOpacity / 100;

  switch (heroImage.overlay) {
    case "light":
      return { backgroundColor: `rgba(255, 255, 255, ${opacity})` };
    case "dark":
      return { backgroundColor: `rgba(0, 0, 0, ${opacity})` };
    case "gradient":
      return {
        background: `linear-gradient(to bottom, rgba(0,0,0,${opacity * 0.3}) 0%, rgba(0,0,0,${opacity}) 100%)`,
      };
    default:
      return null;
  }
}

/**
 * Calculate days until wedding
 */
export function getDaysUntilWedding(weddingDate: Date): number {
  const now = new Date();
  const diffTime = weddingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format wedding date for display
 */
export function formatWeddingDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
