import { prisma, withTenantContext } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ContentSection } from "@/components/content/ContentSection";
import { getVisibleEvents, type VisibleEvent } from "@/lib/events/event-utils";
import { ChevronDown, Calendar, MapPin, Clock, Shirt } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Get hero overlay style based on theme settings
 */
function getOverlayStyle(theme: ThemeSettings) {
  const heroImage = theme.heroImage;
  if (!heroImage || heroImage.overlay === "none") return null;

  const opacity = heroImage.overlayOpacity / 100;

  switch (heroImage.overlay) {
    case "light":
      return { backgroundColor: `rgba(255, 255, 255, ${opacity})` };
    case "dark":
      return { backgroundColor: `rgba(0, 0, 0, ${opacity})` };
    case "gradient":
      return {
        background: `linear-gradient(to bottom, rgba(0,0,0,${opacity * 0.3}) 0%, rgba(0,0,0,${opacity}) 100%)`,
      };
    default:
      return null;
  }
}

/**
 * Calculate days until wedding
 */
function getDaysUntilWedding(weddingDate: Date): number {
  const now = new Date();
  const diffTime = weddingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format wedding date for display
 */
function formatWeddingDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-8 shadow-lg"
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
  const hasHeroImage = !!theme.heroImage?.url;
  const overlayStyle = hasHeroImage ? getOverlayStyle(theme) : null;

  // Calculate countdown
  const weddingDate = tenant.wedding.weddingDate
    ? new Date(tenant.wedding.weddingDate)
    : null;
  const daysUntil = weddingDate ? getDaysUntilWedding(weddingDate) : 0;

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
      {/* Hero Section - styled to match Theme Studio preview */}
      <header
        className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 md:py-20"
        style={
          hasHeroImage
            ? { backgroundColor: theme.primaryColor }
            : {
                backgroundColor: theme.primaryColor,
                backgroundImage: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
              }
        }
      >
        {/* Hero image background */}
        {hasHeroImage && theme.heroImage && (
          <Image
            src={theme.heroImage.url}
            alt={theme.heroImage.alt || "Wedding hero image"}
            fill
            priority
            className="object-cover"
            style={{
              objectPosition:
                theme.heroImage.position === "top"
                  ? "top"
                  : theme.heroImage.position === "bottom"
                  ? "bottom"
                  : "center",
            }}
          />
        )}

        {/* Hero image overlay */}
        {hasHeroImage && overlayStyle && (
          <div className="absolute inset-0" style={overlayStyle} />
        )}

        {/* Decorative pattern overlay (only when no hero image) */}
        {!hasHeroImage && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        )}

        {/* Content - white text on colored/image background */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Tagline */}
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ color: "#ffffff" }}
          >
            We&apos;re getting married!
          </p>

          {/* Partner names */}
          <h1
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{
              fontFamily: "var(--wedding-font-heading)",
              color: "#ffffff",
            }}
          >
            {tenant.wedding!.partner1Name}
            <span className="block text-3xl md:text-4xl font-normal my-2">&</span>
            {tenant.wedding!.partner2Name}
          </h1>

          {/* Wedding date with decorative lines */}
          {weddingDate && (
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px w-16 bg-white/40" />
              <p
                className="text-xl md:text-2xl font-light"
                style={{ color: "#ffffff" }}
              >
                {formatWeddingDate(weddingDate)}
              </p>
              <div className="h-px w-16 bg-white/40" />
            </div>
          )}

          {/* Countdown */}
          {daysUntil > 0 && (
            <div className="mt-8">
              <p
                className="text-sm uppercase tracking-wider opacity-70 mb-2"
                style={{ color: "#ffffff" }}
              >
                Days Until We Say &quot;I Do&quot;
              </p>
              <p className="text-6xl font-bold" style={{ color: "#ffffff" }}>
                {daysUntil}
              </p>
            </div>
          )}

          {/* RSVP Button */}
          <Link
            href={`/${domain}/rsvp`}
            className="inline-block mt-10 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              backgroundColor: "#ffffff",
              color: theme.primaryColor,
            }}
          >
            RSVP Now
          </Link>
        </div>

        {/* Section navigation */}
        {allNavLinks.length > 0 && (
          <nav className="relative z-10 mt-12">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {allNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm uppercase tracking-wider transition-colors hover:opacity-100"
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "var(--wedding-font-body)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Scroll indicator */}
        {(visibleSections.length > 0 || events.length > 0) && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white/40" />
          </div>
        )}
      </header>

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

      {/* Footer - styled to match preview */}
      <footer
        className="py-12 px-4 text-center"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-2xl mx-auto">
          <h3
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--wedding-font-heading)",
              color: "#ffffff",
            }}
          >
            {tenant.wedding!.partner1Name} & {tenant.wedding!.partner2Name}
          </h3>

          {weddingDate && (
            <p className="text-white/80 mb-6">{formatWeddingDate(weddingDate)}</p>
          )}

          <p className="text-white/60 text-sm">
            We can&apos;t wait to celebrate with you!
          </p>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/50 text-xs">
              Made with love using Wedding Platform
            </p>
          </div>
        </div>
      </footer>
    </main>
  ));
}
