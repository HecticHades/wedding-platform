"use client";

import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface PreviewFooterProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewFooter({ content, theme }: PreviewFooterProps) {
  return (
    <footer
      className="py-12 px-4 text-center"
      style={{ backgroundColor: theme.primaryColor }}
    >
      <div className="max-w-2xl mx-auto">
        <h3
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{
            fontFamily: theme.headingFont,
            color: "#ffffff",
          }}
        >
          {content.couple.partner1} & {content.couple.partner2}
        </h3>

        <p className="text-white/80 mb-6">{content.date.display}</p>

        <p className="text-white/60 text-sm">
          We can't wait to celebrate with you!
        </p>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/50 text-xs">
            Made with love using Wedding Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
