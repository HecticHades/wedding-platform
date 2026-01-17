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
      },
      fontFamily: {
        wedding: ["var(--wedding-font-body)", "serif"],
        "wedding-heading": ["var(--wedding-font-heading)", "cursive"],
      },
    },
  },
  plugins: [],
} satisfies Config;
