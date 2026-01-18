import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Heart, MapPin } from "lucide-react";
import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedButton } from "@/components/theme/ThemedButton";

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

export default async function GuestSeatingPage({ params }: PageProps) {
  const { domain } = await params;

  // Get wedding by subdomain
  const wedding = await getWeddingByDomain(domain);

  if (!wedding) {
    notFound();
  }

  // Check RSVP cookie for guest authentication
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(`rsvp_guest_${wedding.id}`);
  const guestId = guestCookie?.value;

  const weddingDateStr = wedding.weddingDate
    ? formatWeddingDate(new Date(wedding.weddingDate))
    : null;

  // If no guest cookie, prompt to RSVP first
  if (!guestId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-wedding-background to-wedding-primary/5 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <Heart className="w-10 h-10 mx-auto text-wedding-secondary fill-wedding-secondary/30" />
          </div>

          <h1 className="font-wedding-heading text-3xl text-wedding-primary mb-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>

          {weddingDateStr && (
            <p className="font-wedding text-wedding-text/70 mb-8">
              {weddingDateStr}
            </p>
          )}

          <ThemedCard variant="glass" className="p-8">
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
        </div>
      </main>
    );
  }

  // Get guest's table assignment
  const assignment = await getGuestTableAssignment(guestId);

  // If no assignment yet, show pending message
  if (!assignment) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-wedding-background to-wedding-primary/5 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <Heart className="w-10 h-10 mx-auto text-wedding-secondary fill-wedding-secondary/30" />
          </div>

          <h1 className="font-wedding-heading text-3xl text-wedding-primary mb-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>

          {weddingDateStr && (
            <p className="font-wedding text-wedding-text/70 mb-8">
              {weddingDateStr}
            </p>
          )}

          <ThemedCard variant="glass" className="p-8">
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
        </div>
      </main>
    );
  }

  // Show table assignment
  return (
    <main className="min-h-screen bg-gradient-to-b from-wedding-background to-wedding-primary/5 py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <Heart className="w-10 h-10 mx-auto text-wedding-secondary fill-wedding-secondary/30" />
        </div>

        <h1 className="font-wedding-heading text-3xl text-wedding-primary mb-2">
          {wedding.partner1Name} & {wedding.partner2Name}
        </h1>

        {weddingDateStr && (
          <p className="font-wedding text-wedding-text/70 mb-8">
            {weddingDateStr}
          </p>
        )}

        <ThemedCard variant="glass" className="p-8">
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

        <Link
          href={`/${domain}`}
          className="inline-block mt-8 text-wedding-secondary hover:underline"
        >
          Back to Wedding Site
        </Link>
      </div>
    </main>
  );
}
