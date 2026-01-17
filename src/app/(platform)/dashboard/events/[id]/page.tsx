import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

  // Fetch event with tenant context
  const event = await withTenantContext(session.user.tenantId, async () => {
    return prisma.event.findFirst({
      where: { id },
    });
  });

  if (!event) {
    notFound();
  }

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-gray-600">
          Update the details for {event.name}.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <EventForm event={event} />
      </div>
    </div>
  );
}
