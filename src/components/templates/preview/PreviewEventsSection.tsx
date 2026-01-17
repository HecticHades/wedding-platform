"use client";

import { MapPin, Clock, Calendar } from "lucide-react";
import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface PreviewEventsSectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewEventsSection({ content, theme }: PreviewEventsSectionProps) {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          Wedding Events
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {content.events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg"
              style={{ borderTop: `4px solid ${theme.accentColor}` }}
            >
              <h3
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: theme.headingFont,
                  color: theme.textColor,
                }}
              >
                {event.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <span style={{ color: theme.textColor }}>{event.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock
                    className="w-5 h-5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <span style={{ color: theme.textColor }}>{event.time}</span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 mt-0.5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: theme.textColor }}
                    >
                      {event.venue}
                    </p>
                    <p
                      className="text-sm opacity-70"
                      style={{ color: theme.textColor }}
                    >
                      {event.address}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="mt-6 w-full py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: `${theme.secondaryColor}20`,
                  color: theme.secondaryColor,
                }}
              >
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
