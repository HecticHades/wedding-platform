"use client";

import { ThemeProvider } from "./ThemeProvider";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface LivePreviewProps {
  theme: ThemeSettings;
}

/**
 * LivePreview shows a miniature wedding site preview with current theme settings.
 * Updates in real-time as theme values change.
 */
export function LivePreview({ theme }: LivePreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className="bg-wedding-background text-wedding-text rounded-lg border border-gray-200 shadow-lg overflow-hidden">
        {/* Preview container with scaled content */}
        <div className="transform scale-100 origin-top-left">
          {/* Header */}
          <header className="bg-wedding-primary/10 py-8 px-6 text-center">
            <h1 className="font-wedding-heading text-4xl text-wedding-primary mb-2">
              Emma & James
            </h1>
            <p className="font-wedding text-wedding-secondary text-lg">
              Are getting married
            </p>
          </header>

          {/* Wedding Date */}
          <div className="py-6 px-6 text-center border-b border-wedding-secondary/20">
            <p className="font-wedding text-sm text-wedding-text/70 uppercase tracking-wider mb-1">
              Save the Date
            </p>
            <p className="font-wedding-heading text-2xl text-wedding-primary">
              September 15, 2025
            </p>
            <p className="font-wedding text-wedding-text/80 mt-1">
              The Grand Estate, Napa Valley
            </p>
          </div>

          {/* Sample Body Text */}
          <div className="py-6 px-6">
            <p className="font-wedding text-wedding-text leading-relaxed">
              We invite you to share in our joy as we celebrate our wedding day.
              Join us for an evening of love, laughter, and dancing under the stars.
            </p>
          </div>

          {/* Sample Button */}
          <div className="py-4 px-6 text-center">
            <button className="bg-wedding-accent hover:bg-wedding-accent/90 text-white font-wedding px-6 py-2 rounded-lg transition-colors">
              RSVP Now
            </button>
          </div>

          {/* Footer */}
          <footer className="bg-wedding-secondary/10 py-4 px-6 text-center">
            <p className="font-wedding text-sm text-wedding-text/60">
              #EmmaAndJames2025
            </p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
