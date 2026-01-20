import { notFound } from "next/navigation";
import { getGuestWithEvents } from "./actions";
import { RsvpFormPage } from "./RsvpFormPage";

interface PageProps {
  params: Promise<{ domain: string; guestId: string }>;
}

export default async function GuestRsvpPage({ params }: PageProps) {
  const { domain, guestId } = await params;

  const guest = await getGuestWithEvents(guestId);

  if (!guest) {
    notFound();
  }

  // Security: Verify guest belongs to this wedding (subdomain match)
  if (guest.wedding.subdomain !== domain) {
    notFound();
  }

  // Format wedding date
  const weddingDateStr = guest.wedding.weddingDate
    ? new Date(guest.wedding.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-wedding-background to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-wedding text-wedding-primary text-sm uppercase tracking-widest mb-2">
            RSVP
          </p>
          <h1 className="font-wedding-heading text-3xl text-wedding-primary mb-2">
            {guest.wedding.coupleNames}
          </h1>
          {weddingDateStr && (
            <p className="font-wedding text-wedding-text">{weddingDateStr}</p>
          )}
        </div>

        {/* Guest Greeting */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-sm border border-wedding-primary/10">
            <span className="font-wedding text-wedding-text">Hi, </span>
            <span className="font-wedding-heading text-wedding-primary">
              {guest.name}
            </span>
            <span className="font-wedding text-wedding-text">!</span>
          </div>
        </div>

        {/* RSVP Forms */}
        <RsvpFormPage
          guestId={guest.id}
          guestName={guest.name}
          coupleNames={guest.wedding.coupleNames}
          allowPlusOne={guest.allowPlusOne}
          domain={domain}
          events={guest.events.map((e) => ({
            ...e,
            dateTime: new Date(e.dateTime),
            endTime: e.endTime ? new Date(e.endTime) : null,
            currentRsvp: e.currentRsvp.rsvpStatus
              ? {
                  ...e.currentRsvp,
                  rsvpAt: e.currentRsvp.rsvpAt
                    ? new Date(e.currentRsvp.rsvpAt)
                    : null,
                }
              : undefined,
          }))}
        />
      </div>
    </div>
  );
}
