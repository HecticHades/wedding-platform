"use client";

import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface PreviewHeroSectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewHeroSection({ content, theme }: PreviewHeroSectionProps) {
  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center text-center px-4 py-20"
      style={{
        backgroundColor: theme.primaryColor,
        backgroundImage: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
      }}
    >
      {/* Decorative overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-2xl">
        <p
          className="text-sm uppercase tracking-widest mb-4 opacity-80"
          style={{ color: "#ffffff" }}
        >
          {content.couple.tagline}
        </p>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6"
          style={{
            fontFamily: theme.headingFont,
            color: "#ffffff",
          }}
        >
          {content.couple.partner1}
          <span className="block text-3xl md:text-4xl font-normal my-2">&</span>
          {content.couple.partner2}
        </h1>

        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px w-16 bg-white/40" />
          <p
            className="text-xl md:text-2xl font-light"
            style={{ color: "#ffffff" }}
          >
            {content.date.display}
          </p>
          <div className="h-px w-16 bg-white/40" />
        </div>

        {content.date.countdown > 0 && (
          <div className="mt-8">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-2" style={{ color: "#ffffff" }}>
              Days Until We Say "I Do"
            </p>
            <p
              className="text-6xl font-bold"
              style={{ color: "#ffffff" }}
            >
              {content.date.countdown}
            </p>
          </div>
        )}

        <button
          className="mt-10 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
          style={{
            backgroundColor: "#ffffff",
            color: theme.primaryColor,
          }}
        >
          RSVP Now
        </button>
      </div>
    </section>
  );
}
