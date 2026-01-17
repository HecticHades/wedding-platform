import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";

export default async function NewEventPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
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
        <span className="text-gray-900">New</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
        <p className="mt-2 text-gray-600">
          Add a new event to your wedding schedule.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <EventForm />
      </div>
    </div>
  );
}
