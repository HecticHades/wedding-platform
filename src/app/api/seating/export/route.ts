import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Papa from "papaparse";

/**
 * GET /api/seating/export
 *
 * Export seating chart data as CSV file.
 * Includes table name, guest name, party, headcount, meal choice, and dietary notes.
 * Used by couples to share seating data with venues for catering.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await withTenantContext(session.user.tenantId, async () => {
      const tables = await prisma.table.findMany({
        orderBy: { order: "asc" },
        include: {
          seatAssignments: {
            include: {
              guest: {
                include: {
                  eventInvitations: {
                    where: { rsvpStatus: "ATTENDING" },
                    select: {
                      plusOneCount: true,
                      mealChoice: true,
                      dietaryNotes: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return tables.flatMap((table) =>
        table.seatAssignments.map((sa) => ({
          Table: table.name,
          "Guest Name": sa.guest.name,
          "Party Name": sa.guest.partyName ?? "",
          Headcount: 1 + (sa.guest.eventInvitations[0]?.plusOneCount ?? 0),
          "Meal Choice": sa.guest.eventInvitations[0]?.mealChoice ?? "",
          "Dietary Notes": sa.guest.eventInvitations[0]?.dietaryNotes ?? "",
        }))
      );
    });

    const csv = Papa.unparse(data);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="seating-chart.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting seating chart:", error);
    return NextResponse.json(
      { error: "Failed to export seating chart" },
      { status: 500 }
    );
  }
}
