import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Utensils } from "lucide-react";
import { MealOptionsEditor } from "@/components/rsvp/MealOptionsEditor";

interface MealOptionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealOptionsPage({ params }: MealOptionsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch event with tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    const event = await prisma.event.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        mealOptions: true,
      },
    });
    return { event };
  });

  if (!data.event) {
    notFound();
  }

  const { event } = data;
  const mealOptions = (event.mealOptions ?? []) as Array<{
    id: string;
    name: string;
    description?: string;
  }>;

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
        <Link
          href={`/dashboard/events/${event.id}`}
          className="hover:text-gray-700 truncate max-w-[150px]"
        >
          {event.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">Meal Options</span>
      </nav>

      {/* Back Link */}
      <Link
        href={`/dashboard/events/${event.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Utensils className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Options</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Configure meal choices guests can select when RSVPing to <strong>{event.name}</strong>.
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Meal options are displayed to guests when they RSVP as attending.
          You can add as many options as needed and reorder them using the arrow buttons.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <MealOptionsEditor eventId={event.id} initialOptions={mealOptions} />
      </div>
    </div>
  );
}
