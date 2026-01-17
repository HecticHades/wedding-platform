import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EventList } from "@/components/events/EventList";

export default async function EventsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch events with tenant context, ordered by dateTime
  const events = await withTenantContext(session.user.tenantId, async () => {
    return prisma.event.findMany({
      orderBy: { dateTime: "asc" },
    });
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-gray-600">
            Manage your wedding events like the ceremony, reception, and other
            celebrations.
          </p>
        </div>

        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Link>
      </div>

      {/* Event list */}
      <EventList events={events} />
    </div>
  );
}
