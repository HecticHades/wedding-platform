import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { MapPin } from "lucide-react";
import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedButton } from "@/components/theme/ThemedButton";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantPageLayout } from "@/components/tenant/TenantPageLayout";
import { TenantFooter } from "@/components/tenant/TenantFooter";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Get wedding by tenant subdomain
 */
async function getWeddingByDomain(domain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        select: {
          id: true,
          rsvpCode: true,
          partner1Name: true,
          partner2Name: true,
          weddingDate: true,
          themeSettings: true,
        },
      },
    },
  });

  return tenant?.wedding ?? null;
}

/**
 * Get guest's table assignment
 */
async function getGuestTableAssignment(guestId: string) {
  const assignment = await prisma.seatAssignment.findUnique({
    where: { guestId },
    include: {
      table: {
        select: {
          name: true,
        },
      },
    },
  });

  return assignment;
}

export default async function GuestSeatingPage({ params }: PageProps) {
  const { domain } = await params;

  // Get wedding by subdomain
  const wedding = await getWeddingByDomain(domain);

  if (!wedding) {
    notFound();
  }

  // Get theme settings
  const theme: ThemeSettings = mergeWithDefaults(
    (wedding.themeSettings as Partial<ThemeSettings>) || {}
  );

  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate)
    : null;

  // Check RSVP cookie for guest authentication
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(`rsvp_guest_${wedding.id}`);
  const guestId = guestCookie?.value;

  // If no guest cookie, prompt to RSVP first
  if (!guestId) {
    return (
      <main className="min-h-screen bg-wedding-background">
        {/* Hero Section */}
        <TenantHero
          theme={theme}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={weddingDate}
          domain={domain}
          variant="subpage"
          pageTitle="Your Table Assignment"
        />

        {/* RSVP prompt */}
        <TenantPageLayout maxWidth="md">
          <ThemedCard variant="glass" className="p-8 text-center">
            <MapPin className="w-8 h-8 mx-auto text-wedding-secondary mb-4" />
            <h2 className="text-xl font-semibold text-wedding-primary mb-2">
              View Your Table Assignment
            </h2>
            <p className="text-wedding-text/70 mb-6">
              Please RSVP first to see your table assignment.
            </p>
            <Link href={`/${domain}/rsvp`}>
              <ThemedButton>Go to RSVP</ThemedButton>
            </Link>
          </ThemedCard>
        </TenantPageLayout>

        {/* Footer */}
        <TenantFooter
          theme={theme}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={weddingDate}
        />
      </main>
    );
  }

  // Get guest's table assignment
  const assignment = await getGuestTableAssignment(guestId);

  // If no assignment yet, show pending message
  if (!assignment) {
    return (
      <main className="min-h-screen bg-wedding-background">
        {/* Hero Section */}
        <TenantHero
          theme={theme}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={weddingDate}
          domain={domain}
          variant="subpage"
          pageTitle="Your Table Assignment"
        />

        {/* Pending message */}
        <TenantPageLayout maxWidth="md">
          <ThemedCard variant="glass" className="p-8 text-center">
            <MapPin className="w-8 h-8 mx-auto text-wedding-secondary mb-4" />
            <h2 className="text-xl font-semibold text-wedding-primary mb-2">
              Table Assignment Pending
            </h2>
            <p className="text-wedding-text/70">
              Your table assignment will be available closer to the wedding date.
            </p>
            <p className="text-sm text-wedding-text/50 mt-4">
              Check back soon!
            </p>
          </ThemedCard>

          <div className="mt-8 text-center">
            <Link
              href={`/${domain}`}
              className="text-wedding-secondary hover:underline"
            >
              Back to Wedding Site
            </Link>
          </div>
        </TenantPageLayout>

        {/* Footer */}
        <TenantFooter
          theme={theme}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={weddingDate}
        />
      </main>
    );
  }

  // Show table assignment
  return (
    <main className="min-h-screen bg-wedding-background">
      {/* Hero Section */}
      <TenantHero
        theme={theme}
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
        domain={domain}
        variant="subpage"
        pageTitle="Your Table Assignment"
      />

      {/* Table assignment */}
      <TenantPageLayout maxWidth="md">
        <ThemedCard variant="glass" className="p-8 text-center">
          <p className="text-sm uppercase tracking-wider text-wedding-secondary mb-4">
            Your Table
          </p>
          <h2 className="text-4xl md:text-5xl font-wedding-heading text-wedding-primary">
            {assignment.table.name}
          </h2>
          <p className="text-wedding-text/70 mt-4">
            We look forward to celebrating with you!
          </p>
        </ThemedCard>

        <div className="mt-8 text-center">
          <Link
            href={`/${domain}`}
            className="text-wedding-secondary hover:underline"
          >
            Back to Wedding Site
          </Link>
        </div>
      </TenantPageLayout>

      {/* Footer */}
      <TenantFooter
        theme={theme}
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
      />
    </main>
  );
}
