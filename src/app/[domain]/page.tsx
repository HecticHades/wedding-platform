import { prisma, withTenantContext } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ContentSection } from "@/components/content/ContentSection";
import {
  DEFAULT_THEME,
  mergeWithDefaults,
  type ThemeSettings,
} from "@/lib/content/theme-utils";
import { Heart, ChevronDown } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ domain: string }>;
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
 * Get anchor links from visible sections for navigation
 */
function getSectionNavLinks(
  sections: PrismaJson.ContentSection[]
): Array<{ href: string; label: string }> {
  const labelMap: Record<string, string> = {
    "event-details": "Events",
    "our-story": "Our Story",
    travel: "Travel",
    gallery: "Gallery",
    timeline: "Schedule",
    contact: "Contact",
  };

  return sections.map((section) => ({
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
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <h1 className="text-2xl font-bold md:text-4xl mb-4 text-gray-900">
          {tenant.name}
        </h1>
        <p className="text-gray-600">
          This wedding site is being set up. Check back soon!
        </p>
      </main>
    );
  }

  // Parse theme settings with fallback to defaults
  const themeSettings: ThemeSettings = mergeWithDefaults(
    (tenant.wedding.themeSettings as Partial<ThemeSettings>) || {}
  );

  // Parse and filter content sections
  const allSections =
    (tenant.wedding.contentSections as PrismaJson.ContentSection[]) || [];
  const visibleSections = allSections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.order - b.order);

  // Get navigation links for visible sections
  const navLinks = getSectionNavLinks(visibleSections);

  // Use tenant context for any further tenant-scoped operations
  return withTenantContext(tenant.id, () => (
    <ThemeProvider theme={themeSettings}>
      <main className="min-h-screen bg-wedding-background">
        {/* Hero Section */}
        <header className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-b from-wedding-primary/5 to-transparent" />

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Small heart decoration */}
            <div className="mb-6">
              <Heart className="w-8 h-8 mx-auto text-wedding-secondary fill-wedding-secondary/30" />
            </div>

            {/* Partner names */}
            <h1 className="font-wedding-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-wedding-primary mb-4">
              {tenant.wedding!.partner1Name}
              <span className="block text-2xl sm:text-3xl md:text-4xl my-2 text-wedding-secondary font-wedding">
                &
              </span>
              {tenant.wedding!.partner2Name}
            </h1>

            {/* Tagline */}
            <p className="font-wedding text-lg md:text-xl text-wedding-text/80 mb-6">
              are getting married
            </p>

            {/* Wedding date */}
            {tenant.wedding!.weddingDate && (
              <div className="mt-8">
                <p className="font-wedding text-sm uppercase tracking-widest text-wedding-secondary/80 mb-2">
                  Save the Date
                </p>
                <p className="font-wedding-heading text-2xl md:text-3xl text-wedding-primary">
                  {formatWeddingDate(new Date(tenant.wedding!.weddingDate))}
                </p>
              </div>
            )}
          </div>

          {/* Section navigation - only show if there are visible sections */}
          {navLinks.length > 0 && (
            <nav className="relative z-10 mt-12">
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-wedding text-sm uppercase tracking-wider text-wedding-text/70 hover:text-wedding-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Scroll indicator */}
          {visibleSections.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-wedding-text/40" />
            </div>
          )}
        </header>

        {/* Content Sections */}
        {visibleSections.length > 0 && (
          <div className="divide-y divide-wedding-primary/10">
            {visibleSections.map((section) => (
              <ContentSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="py-12 px-4 text-center bg-wedding-primary/5">
          <Heart className="w-6 h-6 mx-auto text-wedding-secondary fill-wedding-secondary/30 mb-4" />
          <p className="font-wedding-heading text-xl text-wedding-primary">
            {tenant.wedding!.partner1Name} & {tenant.wedding!.partner2Name}
          </p>
          {tenant.wedding!.weddingDate && (
            <p className="font-wedding text-sm text-wedding-text/60 mt-2">
              {new Date(tenant.wedding!.weddingDate).getFullYear()}
            </p>
          )}
        </footer>
      </main>
    </ThemeProvider>
  ));
}
