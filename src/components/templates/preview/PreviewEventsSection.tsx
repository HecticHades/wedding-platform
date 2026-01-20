"use client";

import { MapPin, Clock, Calendar } from "lucide-react";
import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { getSectionBackgroundStyle, getButtonStyle, getCardStyle } from "@/lib/content/theme-utils";

interface PreviewEventsSectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewEventsSection({ content, theme }: PreviewEventsSectionProps) {
  const sectionBgStyle = getSectionBackgroundStyle(theme, "primary");
  const cardStyle = getCardStyle(theme);
  const buttonStyle = getButtonStyle(theme, "secondary");

  return (
    <section
      className="py-20 px-4"
      style={sectionBgStyle}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
            fontSize: "var(--wedding-font-size-heading, 2rem)",
          }}
        >
          Wedding Events
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {content.events.map((event, index) => (
            <div
              key={index}
              className="bg-white p-8 w-full md:w-[calc(50%-1rem)] max-w-md"
              style={{
                ...cardStyle,
                borderTop: `4px solid ${theme.accentColor}`,
              }}
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
                  <span
                    style={{
                      color: theme.textColor,
                      fontSize: "var(--wedding-font-size-base, 1rem)",
                    }}
                  >
                    {event.date}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock
                    className="w-5 h-5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <span
                    style={{
                      color: theme.textColor,
                      fontSize: "var(--wedding-font-size-base, 1rem)",
                    }}
                  >
                    {event.time}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 mt-0.5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{
                        color: theme.textColor,
                        fontSize: "var(--wedding-font-size-base, 1rem)",
                      }}
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
                className="mt-6 w-full py-2 font-medium transition-colors"
                style={buttonStyle}
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
