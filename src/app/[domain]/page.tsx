import { prisma, withTenantContext } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ContentSection } from "@/components/content/ContentSection";
import { getVisibleEvents, type VisibleEvent } from "@/lib/events/event-utils";
import { Calendar, MapPin, Clock, Shirt } from "lucide-react";
import Link from "next/link";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantFooter } from "@/components/tenant/TenantFooter";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Format event date for display
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format event time for display
 */
function formatEventTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Creates a Google Maps URL from an address
 */
function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Display events from the database (with visibility filtering)
 * Styled to match Theme Studio preview for consistency
 */
function EventsDisplay({ events, theme }: { events: VisibleEvent[]; theme: ThemeSettings }) {
  if (events.length === 0) {
    return (
      <div
        className="py-16 md:py-20 px-4"
        style={{ backgroundColor: `${theme.primaryColor}08` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            id="events-heading"
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: theme.headingFont,
              color: theme.primaryColor,
            }}
          >
            Events
          </h2>
          <p
            className="opacity-70"
            style={{
              fontFamily: theme.fontFamily,
              color: theme.textColor,
            }}
          >
            Event details coming soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="events-heading"
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          Wedding Events
        </h2>

        <div className="grid md:grid-cols-2 gap-8 justify-items-center">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md"
              style={{ borderTop: `4px solid ${theme.accentColor}` }}
            >
              {/* Event name */}
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
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <span style={{ color: theme.textColor }}>
                    {formatEventDate(event.dateTime)}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock
                    className="w-5 h-5"
                    style={{ color: theme.secondaryColor }}
                  />
                  <span style={{ color: theme.textColor }}>
                    {formatEventTime(event.dateTime)}
                    {event.endTime && ` - ${formatEventTime(event.endTime)}`}
                  </span>
                </div>

                {/* Location */}
                {(event.location || event.address) && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-5 h-5 mt-0.5"
                      style={{ color: theme.secondaryColor }}
                    />
                    <div>
                      {event.location && (
                        <p className="font-medium" style={{ color: theme.textColor }}>
                          {event.location}
                        </p>
                      )}
                      {event.address && (
                        <a
                          href={getGoogleMapsUrl(event.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm opacity-70 hover:underline"
                          style={{ color: theme.textColor }}
                        >
                          {event.address}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Dress code */}
                {event.dressCode && (
                  <div className="flex items-center gap-3">
                    <Shirt
                      className="w-5 h-5"
                      style={{ color: theme.secondaryColor }}
                    />
                    <span style={{ color: theme.textColor }}>
                      <span className="font-medium">Dress Code:</span> {event.dressCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p
                  className="mt-4 text-sm leading-relaxed opacity-80 border-t pt-4"
                  style={{
                    color: theme.textColor,
                    borderColor: `${theme.primaryColor}10`,
                  }}
                >
                  {event.description}
                </p>
              )}

              {/* Get Directions Button */}
              {event.address && (
                <a
                  href={getGoogleMapsUrl(event.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-2 rounded-lg font-medium transition-colors text-center block"
                  style={{
                    backgroundColor: `${theme.secondaryColor}20`,
                    color: theme.secondaryColor,
                  }}
                >
                  Get Directions
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Get anchor links from visible sections for navigation
 * Note: event-details is excluded since events are rendered from database
 */
function getSectionNavLinks(
  sections: PrismaJson.ContentSection[]
): Array<{ href: string; label: string }> {
  const labelMap: Record<string, string> = {
    "our-story": "Our Story",
    travel: "Travel",
    gallery: "Gallery",
    timeline: "Schedule",
    contact: "Contact",
  };

  // Filter out event-details since events are now rendered from database via EventsDisplay
  return sections
    .filter((section) => section.type !== "event-details")
    .map((section) => ({
      href: `#${section.type}`,
      label: labelMap[section.type] || section.type,
    }));
}

export default async function TenantHomePage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain (no tenant context needed for this lookup)
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: true,
    },
  });

  if (!tenant) {
    notFound();
  }

  // If tenant exists but no wedding configured yet
  if (!tenant.wedding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-wedding-background">
        <h1 className="text-2xl font-bold font-wedding-heading md:text-4xl mb-4 text-wedding-primary">
          {tenant.name}
        </h1>
        <p className="text-wedding-text/70 font-wedding">
          This wedding site is being set up. Check back soon!
        </p>
      </main>
    );
  }

  // Get theme settings
  const theme: ThemeSettings = mergeWithDefaults(
    (tenant.wedding.themeSettings as Partial<ThemeSettings>) || {}
  );

  // Parse wedding date
  const weddingDate = tenant.wedding.weddingDate
    ? new Date(tenant.wedding.weddingDate)
    : null;

  // Parse and filter content sections
  const allSections =
    (tenant.wedding.contentSections as PrismaJson.ContentSection[]) || [];
  const visibleSections = allSections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.order - b.order);

  // Get navigation links for visible sections
  const navLinks = getSectionNavLinks(visibleSections);

  // Fetch visible events from the database
  // For anonymous visitors (no guestId), this returns only public events
  // Guest identification will be added in Phase 5 with RSVP code
  const events = await getVisibleEvents({ weddingId: tenant.wedding.id });

  // Add Events nav link if we have database events
  const allNavLinks =
    events.length > 0
      ? [{ href: "#events", label: "Events" }, ...navLinks]
      : navLinks;

  // Use tenant context for any further tenant-scoped operations
  return withTenantContext(tenant.id, () => (
    <main className="min-h-screen bg-wedding-background">
      {/* Hero Section */}
      <TenantHero
        theme={theme}
        partner1Name={tenant.wedding!.partner1Name}
        partner2Name={tenant.wedding!.partner2Name}
        weddingDate={weddingDate}
        domain={domain}
        variant="home"
        navLinks={allNavLinks}
        showScrollIndicator={visibleSections.length > 0 || events.length > 0}
      />

      {/* Events Section (from database with visibility filtering) */}
      {events.length > 0 && (
        <section id="events" className="scroll-mt-20">
          <EventsDisplay events={events} theme={theme} />
        </section>
      )}

      {/* Content Sections */}
      {visibleSections.length > 0 && (
        <div className="divide-y divide-wedding-primary/10">
          {visibleSections.map((section) => (
            <ContentSection key={section.id} section={section} theme={theme} />
          ))}
        </div>
      )}

      {/* Footer */}
      <TenantFooter
        theme={theme}
        partner1Name={tenant.wedding!.partner1Name}
        partner2Name={tenant.wedding!.partner2Name}
        weddingDate={weddingDate}
      />
    </main>
  ));
}
