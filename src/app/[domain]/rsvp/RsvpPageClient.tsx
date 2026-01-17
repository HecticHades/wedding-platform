"use client";

import { useRouter } from "next/navigation";
import { RsvpCodeEntry } from "@/components/rsvp/RsvpCodeEntry";
import { GuestLookup } from "@/components/rsvp/GuestLookup";

interface RsvpPageClientProps {
  weddingId: string;
  hasRsvpCode: boolean;
  initialAuthenticated: boolean;
  domain: string;
}

export function RsvpPageClient({
  weddingId,
  hasRsvpCode,
  initialAuthenticated,
  domain,
}: RsvpPageClientProps) {
  const router = useRouter();

  // Handle successful code entry
  function handleCodeSuccess() {
    // Refresh to re-run server component and read new cookie
    router.refresh();
  }

  // If no RSVP code required or already authenticated, show guest lookup
  if (!hasRsvpCode || initialAuthenticated) {
    return <GuestLookup weddingId={weddingId} domain={domain} />;
  }

  // Show code entry form
  return <RsvpCodeEntry weddingId={weddingId} onSuccess={handleCodeSuccess} />;
}
