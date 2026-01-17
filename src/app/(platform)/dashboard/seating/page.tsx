import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { SeatingChart } from "@/components/seating/SeatingChart";
import Link from "next/link";
import { ChevronRight, Home, Printer } from "lucide-react";

interface GuestForSeating {
  id: string;
  name: string;
  plusOneCount: number | null;
}

interface TableWithGuests {
  id: string;
  name: string;
  capacity: number;
  guests: GuestForSeating[];
}

async function getSeatingData(tenantId: string): Promise<{
  tables: TableWithGuests[];
  unassignedGuests: GuestForSeating[];
}> {
  return withTenantContext(tenantId, async () => {
    // Get wedding
    const wedding = await prisma.wedding.findFirst({
      select: { id: true },
    });

    if (!wedding) {
      return { tables: [], unassignedGuests: [] };
    }

    // Get all tables with their assigned guests
    const tablesData = await prisma.table.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: "asc" },
      include: {
        seatAssignments: {
          include: {
            guest: {
              select: {
                id: true,
                name: true,
                eventInvitations: {
                  where: { rsvpStatus: "ATTENDING" },
                  select: { plusOneCount: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Transform tables data
    const tables: TableWithGuests[] = tablesData.map((table) => ({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      guests: table.seatAssignments.map((sa) => ({
        id: sa.guest.id,
        name: sa.guest.name,
        plusOneCount: sa.guest.eventInvitations[0]?.plusOneCount ?? null,
      })),
    }));

    // Get unassigned guests who are ATTENDING at least one event
    // (no seatAssignment and at least one ATTENDING invitation)
    const unassignedGuestsData = await prisma.guest.findMany({
      where: {
        weddingId: wedding.id,
        seatAssignment: null,
        eventInvitations: {
          some: { rsvpStatus: "ATTENDING" },
        },
      },
      select: {
        id: true,
        name: true,
        eventInvitations: {
          where: { rsvpStatus: "ATTENDING" },
          select: { plusOneCount: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    const unassignedGuests: GuestForSeating[] = unassignedGuestsData.map((g) => ({
      id: g.id,
      name: g.name,
      plusOneCount: g.eventInvitations[0]?.plusOneCount ?? null,
    }));

    return { tables, unassignedGuests };
  });
}

export default async function SeatingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const { tables, unassignedGuests } = await getSeatingData(session.user.tenantId);

  // Calculate stats
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedGuests = tables.reduce((sum, t) => sum + t.guests.length, 0);
  const assignedSeats = tables.reduce(
    (sum, t) =>
      sum + t.guests.reduce((gSum, g) => gSum + 1 + (g.plusOneCount ?? 0), 0),
    0
  );

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-gray-700 flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Seating Chart</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seating Chart</h1>
          <p className="mt-2 text-gray-600">
            Drag and drop guests to assign them to tables.
            {tables.length > 0 && (
              <span className="ml-2">
                <strong>{assignedSeats}</strong> of <strong>{totalSeats}</strong>{" "}
                seats filled ({assignedGuests} guests, {unassignedGuests.length}{" "}
                unassigned).
              </span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/seating/print"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print View
        </Link>
      </div>

      {/* Seating Chart */}
      <SeatingChart tables={tables} unassignedGuests={unassignedGuests} />
    </div>
  );
}
