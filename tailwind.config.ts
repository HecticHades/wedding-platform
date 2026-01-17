import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        wedding: {
          primary: "var(--wedding-primary)",
          secondary: "var(--wedding-secondary)",
          background: "var(--wedding-background)",
          text: "var(--wedding-text)",
          accent: "var(--wedding-accent)",
        },
        // Landing page colors
        landing: {
          violet: "#7C3AED",
          pink: "#EC4899",
        },
        // Couples dashboard colors
        dashboard: {
          bg: "var(--dashboard-bg)",
          primary: "var(--dashboard-primary)",
          secondary: "var(--dashboard-secondary)",
          gold: "var(--dashboard-gold)",
          text: "var(--dashboard-text)",
          border: "var(--dashboard-border)",
        },
        // Admin dashboard colors
        admin: {
          sidebar: "#0f172a",
          "sidebar-hover": "#1e293b",
          primary: "#2563eb",
        },
      },
      fontFamily: {
        wedding: ["var(--wedding-font-body)", "serif"],
        "wedding-heading": ["var(--wedding-font-heading)", "cursive"],
        // Landing page fonts
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        "great-vibes": ["Great Vibes", "cursive"],
        // Couples dashboard fonts
        cormorant: ["Cormorant Garamond", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        "landing-cta": "0 10px 40px -10px rgba(124, 58, 237, 0.25)",
        bento: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "bento-hover": "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
