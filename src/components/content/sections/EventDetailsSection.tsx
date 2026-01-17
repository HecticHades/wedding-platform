import { Calendar, MapPin, Clock, Shirt } from "lucide-react";

interface EventDetailsSectionProps {
  content: PrismaJson.EventDetailsContent;
}

/**
 * Formats a date string for display
 * @param dateStr - ISO date string or date string
 * @returns Formatted date like "Saturday, June 15, 2025"
 */
function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Creates a Google Maps URL from an address
 */
function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * EventDetailsSection displays the wedding ceremony, reception, and other event information.
 * Renders event cards with date, time, location, and optional dress code.
 */
export function EventDetailsSection({ content }: EventDetailsSectionProps) {
  if (content.events.length === 0) {
    return null;
  }

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-background">
      <div className="max-w-4xl mx-auto">
        <h2
          id="event-details-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-10"
        >
          Event Details
        </h2>

        <div className="space-y-6">
          {content.events.map((event, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-wedding-primary/10 p-6 md:p-8"
            >
              {/* Event name */}
              <h3 className="font-wedding-heading text-2xl md:text-3xl text-wedding-primary mb-4">
                {event.name}
              </h3>

              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-start gap-3 text-wedding-text">
                  <Calendar className="h-5 w-5 text-wedding-secondary flex-shrink-0 mt-0.5" />
                  <span className="font-wedding">{formatEventDate(event.date)}</span>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3 text-wedding-text">
                  <Clock className="h-5 w-5 text-wedding-secondary flex-shrink-0 mt-0.5" />
                  <span className="font-wedding">{event.time}</span>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 text-wedding-text">
                  <MapPin className="h-5 w-5 text-wedding-secondary flex-shrink-0 mt-0.5" />
                  <div className="font-wedding">
                    <p className="font-medium">{event.location}</p>
                    <a
                      href={getGoogleMapsUrl(event.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wedding-accent hover:underline text-sm"
                    >
                      {event.address}
                    </a>
                  </div>
                </div>

                {/* Dress code */}
                {event.dressCode && (
                  <div className="flex items-start gap-3 text-wedding-text">
                    <Shirt className="h-5 w-5 text-wedding-secondary flex-shrink-0 mt-0.5" />
                    <span className="font-wedding">
                      <span className="font-medium">Dress Code:</span> {event.dressCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="mt-4 font-wedding text-wedding-text/80 leading-relaxed border-t border-wedding-primary/10 pt-4">
                  {event.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
