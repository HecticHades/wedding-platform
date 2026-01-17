import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { SeatingPrintView } from "@/components/seating/SeatingPrintView";
import { PrintButton } from "@/components/seating/PrintButton";

/**
 * Get tables with guests for print view
 */
async function getTablesWithGuests(tenantId: string) {
  return withTenantContext(tenantId, async () => {
    const tables = await prisma.table.findMany({
      orderBy: { order: "asc" },
      include: {
        seatAssignments: {
          include: {
            guest: {
              include: {
                eventInvitations: {
                  where: { rsvpStatus: "ATTENDING" },
                  select: { plusOneCount: true },
                },
              },
            },
          },
        },
      },
    });

    return tables.map((table) => ({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      guests: table.seatAssignments.map((sa) => ({
        id: sa.guest.id,
        name: sa.guest.name,
        partyName: sa.guest.partyName,
        plusOneCount: sa.guest.eventInvitations[0]?.plusOneCount ?? 0,
      })),
    }));
  });
}

/**
 * Get wedding info for the header
 */
async function getWeddingInfo(tenantId: string) {
  return withTenantContext(tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: {
        partner1Name: true,
        partner2Name: true,
      },
    });

    return wedding ?? { partner1Name: "", partner2Name: "" };
  });
}

export default async function SeatingPrintPage() {
  const session = await auth();

  if (!session?.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const [tables, wedding] = await Promise.all([
    getTablesWithGuests(session.user.tenantId),
    getWeddingInfo(session.user.tenantId),
  ]);

  const weddingName = `${wedding.partner1Name} & ${wedding.partner2Name}`;

  return (
    <>
      {/* Screen-only header with actions */}
      <div className="print:hidden p-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/seating"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Seating
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold">Seating Chart - Print Preview</h1>
        </div>

        <div className="flex gap-3">
          <a
            href="/api/seating/export"
            download
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Print content */}
      <div className="p-8 print:p-0 bg-gray-50 print:bg-white min-h-screen">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-sm print:shadow-none print:max-w-none">
          <SeatingPrintView tables={tables} weddingName={weddingName} />
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }

          @page {
            margin: 0.5in;
            size: letter portrait;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
