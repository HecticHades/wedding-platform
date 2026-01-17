import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight, Users, Utensils } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch event with tenant context including invitation count
  const data = await withTenantContext(session.user.tenantId, async () => {
    const event = await prisma.event.findFirst({
      where: { id },
      include: {
        _count: {
          select: { guestInvitations: true },
        },
      },
    });
    return { event };
  });

  if (!data.event) {
    notFound();
  }

  const { event } = data;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/dashboard/events" className="hover:text-gray-700">
          Events
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 truncate max-w-[200px]">{event.name}</span>
      </nav>

      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="mt-2 text-gray-600">
            Update the details for {event.name}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/events/${event.id}/meal-options`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Utensils className="h-4 w-4" />
            Meal Options
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/guests`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            Manage Guests
            {event._count.guestInvitations > 0 && (
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {event._count.guestInvitations}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <EventForm event={event} />
      </div>
    </div>
  );
}
