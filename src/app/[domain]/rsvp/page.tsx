import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getWeddingByDomain } from "./actions";
import { RsvpPageClient } from "./RsvpPageClient";
import { Heart } from "lucide-react";

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

export default async function RsvpPage({ params }: PageProps) {
  const { domain } = await params;

  const wedding = await getWeddingByDomain(domain);

  if (!wedding) {
    notFound();
  }

  // Check for existing RSVP auth cookie
  let isAuthenticated = false;
  if (wedding.rsvpCode) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`rsvp_auth_${wedding.id}`);
    isAuthenticated = authCookie?.value === wedding.rsvpCode;
  } else {
    // No code required - guest is automatically "authenticated"
    isAuthenticated = true;
  }

  const weddingDateStr = wedding.weddingDate
    ? formatWeddingDate(new Date(wedding.weddingDate))
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-wedding-background to-wedding-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          {/* Heart decoration */}
          <div className="mb-6">
            <Heart className="w-10 h-10 mx-auto text-wedding-secondary fill-wedding-secondary/30" />
          </div>

          {/* Couple names */}
          <h1 className="font-wedding-heading text-3xl sm:text-4xl md:text-5xl text-wedding-primary mb-3">
            {wedding.partner1Name}
            <span className="block text-lg sm:text-xl md:text-2xl my-2 text-wedding-secondary font-wedding">
              &
            </span>
            {wedding.partner2Name}
          </h1>

          {/* Wedding date */}
          {weddingDateStr && (
            <p className="font-wedding text-wedding-text/70 mt-4">
              {weddingDateStr}
            </p>
          )}

          {/* RSVP title */}
          <div className="mt-8">
            <p className="font-wedding text-sm uppercase tracking-widest text-wedding-secondary/80">
              RSVP
            </p>
          </div>
        </header>

        {/* RSVP Flow */}
        <RsvpPageClient
          weddingId={wedding.id}
          hasRsvpCode={!!wedding.rsvpCode}
          initialAuthenticated={isAuthenticated}
        />
      </div>
    </main>
  );
}
