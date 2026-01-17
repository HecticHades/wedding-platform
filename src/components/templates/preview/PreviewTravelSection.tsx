"use client";

import { Hotel, Plane, ExternalLink } from "lucide-react";
import type { PreviewContent } from "./previewContent";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface PreviewTravelSectionProps {
  content: PreviewContent;
  theme: ThemeSettings;
}

export function PreviewTravelSection({ content, theme }: PreviewTravelSectionProps) {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: `${theme.secondaryColor}10` }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          Travel & Accommodations
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Hotels */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: `1px solid ${theme.primaryColor}20` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <Hotel className="w-5 h-5" style={{ color: theme.secondaryColor }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.textColor }}
              >
                Recommended Hotels
              </h3>
            </div>

            <div className="space-y-4">
              {content.travel.hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: `${theme.primaryColor}05` }}
                >
                  <div>
                    <p className="font-medium" style={{ color: theme.textColor }}>
                      {hotel.name}
                    </p>
                    <p
                      className="text-sm opacity-70"
                      style={{ color: theme.textColor }}
                    >
                      {hotel.distance} from venue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: theme.accentColor }}>
                      {hotel.rate}
                    </p>
                    <button
                      className="text-sm flex items-center gap-1 mt-1"
                      style={{ color: theme.secondaryColor }}
                    >
                      Book <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Airports */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: `1px solid ${theme.primaryColor}20` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <Plane className="w-5 h-5" style={{ color: theme.secondaryColor }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.textColor }}
              >
                Nearby Airports
              </h3>
            </div>

            <div className="space-y-3">
              {content.travel.airports.map((airport, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${theme.primaryColor}05` }}
                >
                  <p style={{ color: theme.textColor }}>{airport}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
