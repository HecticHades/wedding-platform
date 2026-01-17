import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { GuestList } from "@/components/guests/GuestList";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default async function GuestsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch guests with tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { eventInvitations: true },
        },
      },
    });
    return { guests };
  });

  // Calculate summary stats
  const totalGuests = data.guests.length;
  const totalAttendees = data.guests.reduce((sum, g) => sum + g.partySize, 0);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Guests</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Guest List</h1>
        <p className="mt-2 text-gray-600">
          Manage your wedding guests. {totalGuests > 0 && (
            <span>
              You have <strong>{totalGuests}</strong> {totalGuests === 1 ? "guest" : "guests"}
              {totalAttendees !== totalGuests && (
                <span> ({totalAttendees} total attendees)</span>
              )}.
            </span>
          )}
        </p>
      </div>

      {/* Guest list component */}
      <GuestList guests={data.guests} />
    </div>
  );
}
