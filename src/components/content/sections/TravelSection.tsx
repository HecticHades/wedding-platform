import { Hotel, Phone, Globe, MapPin, Plane, Car } from "lucide-react";

interface TravelSectionProps {
  content: PrismaJson.TravelContent;
}

/**
 * TravelSection displays accommodation recommendations, directions, and airport info.
 * Renders hotel cards with contact information and booking codes.
 */
export function TravelSection({ content }: TravelSectionProps) {
  // Don't render if no content
  const hasHotels = content.hotels.length > 0;
  const hasDirections = content.directions?.trim();
  const hasAirportInfo = content.airportInfo?.trim();

  if (!hasHotels && !hasDirections && !hasAirportInfo) {
    return null;
  }

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-background">
      <div className="max-w-4xl mx-auto">
        <h2
          id="travel-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-10"
        >
          Travel & Accommodations
        </h2>

        {/* Hotels */}
        {hasHotels && (
          <div className="mb-10">
            <h3 className="font-wedding-heading text-xl md:text-2xl text-wedding-secondary text-center mb-6">
              Where to Stay
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {content.hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-wedding-primary/10 p-5"
                >
                  {/* Hotel name */}
                  <div className="flex items-start gap-3 mb-3">
                    <Hotel className="h-5 w-5 text-wedding-primary flex-shrink-0 mt-0.5" />
                    <h4 className="font-wedding font-medium text-wedding-text text-lg">
                      {hotel.name}
                    </h4>
                  </div>

                  <div className="space-y-2 pl-8">
                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-wedding-text/80">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span className="font-wedding">{hotel.address}</span>
                    </div>

                    {/* Phone */}
                    {hotel.phone && (
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="h-4 w-4 text-wedding-text/80 flex-shrink-0 mt-0.5" />
                        <a
                          href={`tel:${hotel.phone}`}
                          className="font-wedding text-wedding-accent hover:underline"
                        >
                          {hotel.phone}
                        </a>
                      </div>
                    )}

                    {/* Website */}
                    {hotel.website && (
                      <div className="flex items-start gap-2 text-sm">
                        <Globe className="h-4 w-4 text-wedding-text/80 flex-shrink-0 mt-0.5" />
                        <a
                          href={hotel.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-wedding text-wedding-accent hover:underline truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    {/* Booking code */}
                    {hotel.bookingCode && (
                      <div className="mt-3 bg-wedding-accent/10 rounded-lg px-3 py-2">
                        <p className="font-wedding text-sm text-wedding-text">
                          <span className="font-medium">Booking Code:</span>{" "}
                          <span className="font-mono text-wedding-accent">
                            {hotel.bookingCode}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {hotel.notes && (
                      <p className="font-wedding text-sm text-wedding-text/70 italic mt-2">
                        {hotel.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directions */}
        {hasDirections && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="h-5 w-5 text-wedding-secondary" />
              <h3 className="font-wedding-heading text-xl text-wedding-secondary">
                Getting There
              </h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-wedding-primary/10 p-5">
              <p className="font-wedding text-wedding-text leading-relaxed whitespace-pre-wrap">
                {content.directions}
              </p>
            </div>
          </div>
        )}

        {/* Airport Info */}
        {hasAirportInfo && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Plane className="h-5 w-5 text-wedding-secondary" />
              <h3 className="font-wedding-heading text-xl text-wedding-secondary">
                Flying In
              </h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-wedding-primary/10 p-5">
              <p className="font-wedding text-wedding-text leading-relaxed whitespace-pre-wrap">
                {content.airportInfo}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
