/**
 * Template definitions for wedding site themes
 * Each template provides a complete theme preset and default section configuration
 */

import type { ThemeSettings } from "./theme-utils";

/**
 * Section type for default sections
 */
export type SectionType = PrismaJson.SectionType;

/**
 * Template definition structure
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme: ThemeSettings;
  defaultSections: SectionType[];
}

/**
 * Classic Elegance template - traditional wedding aesthetic
 */
const classicTemplate: Template = {
  id: "classic",
  name: "Classic Elegance",
  description:
    "A timeless design with elegant purple and pink tones, featuring script headings and serif body text. Perfect for traditional weddings.",
  thumbnail: "/templates/classic-thumb.svg",
  theme: {
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    accentColor: "#10B981",
    fontFamily: "Playfair Display",
    headingFont: "Great Vibes",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Modern Minimal template - clean and contemporary
 */
const modernTemplate: Template = {
  id: "modern",
  name: "Modern Minimal",
  description:
    "A sleek, contemporary design with black and gray tones. Clean sans-serif typography for a sophisticated, minimalist look.",
  thumbnail: "/templates/modern-thumb.svg",
  theme: {
    primaryColor: "#000000",
    secondaryColor: "#6B7280",
    backgroundColor: "#FAFAFA",
    textColor: "#111827",
    accentColor: "#3B82F6",
    fontFamily: "Inter",
    headingFont: "Montserrat",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Rustic Romance template - warm and natural
 */
const rusticTemplate: Template = {
  id: "rustic",
  name: "Rustic Romance",
  description:
    "A warm, earthy design with brown and amber tones on a cream background. Script headings with serif body for a cozy, natural feel.",
  thumbnail: "/templates/rustic-thumb.svg",
  theme: {
    primaryColor: "#92400E",
    secondaryColor: "#B45309",
    backgroundColor: "#FFFBEB",
    textColor: "#78350F",
    accentColor: "#65A30D",
    fontFamily: "Merriweather",
    headingFont: "Sacramento",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "contact",
  ],
};

/**
 * Garden Party template - fresh botanical aesthetic
 */
const gardenTemplate: Template = {
  id: "garden",
  name: "Garden Party",
  description:
    "Fresh sage greens and soft blush tones inspired by botanical gardens. Elegant Garamond typography with playful script accents for an outdoor celebration.",
  thumbnail: "/templates/garden-thumb.svg",
  theme: {
    primaryColor: "#3D5A45",
    secondaryColor: "#D4A373",
    backgroundColor: "#F8FAF5",
    textColor: "#2D3B30",
    accentColor: "#8FB174",
    fontFamily: "Cormorant Garamond",
    headingFont: "Dancing Script",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Beach Sunset template - coastal destination wedding
 */
const beachTemplate: Template = {
  id: "beach",
  name: "Beach Sunset",
  description:
    "Deep navy and coastal teal evoke ocean waves at sunset. Modern Raleway typography with romantic script for a dreamy seaside destination wedding.",
  thumbnail: "/templates/beach-thumb.svg",
  theme: {
    primaryColor: "#1E3A5F",
    secondaryColor: "#2A9D8F",
    backgroundColor: "#FEFEFE",
    textColor: "#1A2E40",
    accentColor: "#E9C46A",
    fontFamily: "Raleway",
    headingFont: "Parisienne",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Bohemian Dream template - free-spirited eclectic
 */
const bohemianTemplate: Template = {
  id: "bohemian",
  name: "Bohemian Dream",
  description:
    "Warm terracotta and rich gold create an eclectic, free-spirited atmosphere. Playful typography perfect for unconventional couples.",
  thumbnail: "/templates/bohemian-thumb.svg",
  theme: {
    primaryColor: "#A67B5B",
    secondaryColor: "#C9A962",
    backgroundColor: "#FDF8F3",
    textColor: "#4A3728",
    accentColor: "#D4A373",
    fontFamily: "Lora",
    headingFont: "Amatic SC",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "gallery",
    "travel",
    "contact",
  ],
};

/**
 * Formal Black Tie template - luxurious elegant
 */
const formalTemplate: Template = {
  id: "formal",
  name: "Formal Black Tie",
  description:
    "Sophisticated deep navy and champagne gold for the most elegant affairs. Classic Garamond serif with refined Cinzel display for timeless luxury.",
  thumbnail: "/templates/formal-thumb.svg",
  theme: {
    primaryColor: "#1A1A2E",
    secondaryColor: "#C9A962",
    backgroundColor: "#FDFCFA",
    textColor: "#1A1A2E",
    accentColor: "#8B7355",
    fontFamily: "EB Garamond",
    headingFont: "Cinzel",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Vineyard Romance template - wine country wedding
 */
const vineyardTemplate: Template = {
  id: "vineyard",
  name: "Vineyard Romance",
  description:
    "Rich burgundy and deep plum inspired by rolling vineyards at harvest. Elegant Baskerville typography with flowing Allura script for wine country celebrations.",
  thumbnail: "/templates/vineyard-thumb.svg",
  theme: {
    primaryColor: "#722F37",
    secondaryColor: "#8E4585",
    backgroundColor: "#FBF9F7",
    textColor: "#3D2628",
    accentColor: "#9B7E46",
    fontFamily: "Libre Baskerville",
    headingFont: "Allura",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Winter Wonderland template - magical winter wedding
 */
const winterTemplate: Template = {
  id: "winter",
  name: "Winter Wonderland",
  description:
    "Cool slate and icy blue create a magical winter atmosphere. Clean Open Sans with elegant Alex Brush script for a fairytale winter celebration.",
  thumbnail: "/templates/winter-thumb.svg",
  theme: {
    primaryColor: "#2C3E50",
    secondaryColor: "#85C1E9",
    backgroundColor: "#FAFCFE",
    textColor: "#2C3E50",
    accentColor: "#C0C0C0",
    fontFamily: "Open Sans",
    headingFont: "Alex Brush",
  },
  defaultSections: [
    "event-details",
    "our-story",
    "travel",
    "gallery",
    "timeline",
    "contact",
  ],
};

/**
 * Array of all available templates
 */
export const templates: Template[] = [
  classicTemplate,
  modernTemplate,
  rusticTemplate,
  gardenTemplate,
  beachTemplate,
  bohemianTemplate,
  formalTemplate,
  vineyardTemplate,
  winterTemplate,
];

/**
 * Get a template by its ID
 * @param id - Template ID to look up
 * @returns Template if found, undefined otherwise
 */
export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get the default template
 * @returns The classic template as the default
 */
export function getDefaultTemplate(): Template {
  return classicTemplate;
}
