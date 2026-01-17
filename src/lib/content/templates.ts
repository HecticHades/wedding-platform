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
 * Array of all available templates
 */
export const templates: Template[] = [
  classicTemplate,
  modernTemplate,
  rusticTemplate,
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
