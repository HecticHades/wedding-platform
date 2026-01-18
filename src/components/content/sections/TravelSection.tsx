import { Hotel, Phone, Globe, MapPin, Plane, Car, ExternalLink } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface TravelSectionProps {
  content: PrismaJson.TravelContent;
  theme: ThemeSettings;
}

/**
 * TravelSection displays accommodation recommendations, directions, and airport info.
 * Renders hotel cards with contact information and booking codes.
 * Styling matches the Theme Studio preview for consistency.
 */
export function TravelSection({ content, theme }: TravelSectionProps) {
  // Don't render if no content
  const hasHotels = content.hotels.length > 0;
  const hasDirections = content.directions?.trim();
  const hasAirportInfo = content.airportInfo?.trim();

  if (!hasHotels && !hasDirections && !hasAirportInfo) {
    return null;
  }

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: `${theme.secondaryColor}10` }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="travel-heading"
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
          {hasHotels && (
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
                {content.hotels.map((hotel, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${theme.primaryColor}05` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium" style={{ color: theme.textColor }}>
                          {hotel.name}
                        </p>
                        <p
                          className="text-sm opacity-70"
                          style={{ color: theme.textColor }}
                        >
                          {hotel.address}
                        </p>
                      </div>
                      <div className="text-right">
                        {hotel.bookingCode && (
                          <p className="font-medium text-sm" style={{ color: theme.accentColor }}>
                            Code: {hotel.bookingCode}
                          </p>
                        )}
                        {hotel.website && (
                          <a
                            href={hotel.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1 mt-1 justify-end"
                            style={{ color: theme.secondaryColor }}
                          >
                            Book <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    {hotel.notes && (
                      <p
                        className="text-sm mt-2 italic opacity-70"
                        style={{ color: theme.textColor }}
                      >
                        {hotel.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directions & Airport Info */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: `1px solid ${theme.primaryColor}20` }}
          >
            {/* Directions */}
            {hasDirections && (
              <div className={hasAirportInfo ? "mb-6" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${theme.secondaryColor}20` }}
                  >
                    <Car className="w-5 h-5" style={{ color: theme.secondaryColor }} />
                  </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: theme.textColor }}
                  >
                    Getting There
                  </h3>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${theme.primaryColor}05` }}
                >
                  <p
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ color: theme.textColor }}
                  >
                    {content.directions}
                  </p>
                </div>
              </div>
            )}

            {/* Airport Info */}
            {hasAirportInfo && (
              <div>
                <div className="flex items-center gap-3 mb-4">
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
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${theme.primaryColor}05` }}
                >
                  <p
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ color: theme.textColor }}
                  >
                    {content.airportInfo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
