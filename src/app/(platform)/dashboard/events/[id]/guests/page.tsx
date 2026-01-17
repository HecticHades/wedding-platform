import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { EventGuestManager } from "@/components/events/EventGuestManager";

interface EventGuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventGuestsPage({ params }: EventGuestsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch event, all guests, and current invitations with tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    // Fetch the event
    const event = await prisma.event.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        isPublic: true,
      },
    });

    if (!event) {
      return null;
    }

    // Fetch all guests for this wedding
    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        partySize: true,
      },
    });

    // Fetch current invitations for this event
    const invitations = await prisma.eventGuest.findMany({
      where: { eventId: id },
      select: { guestId: true },
    });

    return {
      event,
      guests,
      invitedGuestIds: invitations.map((inv) => inv.guestId),
    };
  });

  if (!data) {
    notFound();
  }

  const { event, guests, invitedGuestIds } = data;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center text-sm text-gray-500 flex-wrap gap-y-1">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
        <Link href="/dashboard/events" className="hover:text-gray-700">
          Events
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
        <Link
          href={`/dashboard/events/${event.id}`}
          className="hover:text-gray-700 truncate max-w-[150px]"
        >
          {event.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
        <span className="text-gray-900 font-medium">Manage Guests</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Guest Invitations</h1>
        </div>
        <p className="mt-2 text-gray-600 ml-11">
          Select which guests should be invited to <strong>{event.name}</strong>.
          {!event.isPublic && (
            <span className="ml-1 text-amber-600">
              This is a private event - only invited guests will see it.
            </span>
          )}
        </p>
      </div>

      {/* Guest manager card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <EventGuestManager
          eventId={event.id}
          eventName={event.name}
          allGuests={guests}
          invitedGuestIds={invitedGuestIds}
        />
      </div>
    </div>
  );
}
