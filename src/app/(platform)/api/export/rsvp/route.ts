import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { generateRsvpCsv, type RsvpExportData } from "@/lib/rsvp/export-utils";

/**
 * GET /api/export/rsvp
 * Export RSVP data as CSV file
 */
export async function GET() {
  try {
    // Auth check: require authenticated user with tenantId
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.tenantId) {
      return NextResponse.json(
        { error: "No tenant context" },
        { status: 403 }
      );
    }

    const tenantId = session.user.tenantId;

    // Fetch all guests with their event invitations
    const exportData = await withTenantContext(tenantId, async () => {
      const guests = await prisma.guest.findMany({
        orderBy: { name: "asc" },
        include: {
          eventInvitations: {
            include: {
              event: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Flatten to one row per guest-event combination
      const rows: RsvpExportData[] = [];

      for (const guest of guests) {
        for (const invitation of guest.eventInvitations) {
          rows.push({
            guestName: guest.name,
            email: guest.email,
            phone: guest.phone,
            partyName: guest.partyName,
            eventName: invitation.event.name,
            rsvpStatus: invitation.rsvpStatus ?? "Pending",
            plusOneCount: invitation.plusOneCount ?? 0,
            plusOneName: invitation.plusOneName,
            mealChoice: invitation.mealChoice,
            dietaryNotes: invitation.dietaryNotes,
            respondedAt: invitation.rsvpAt?.toISOString() ?? null,
          });
        }
      }

      return rows;
    });

    // Generate CSV
    const csv = generateRsvpCsv(exportData);

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0];
    const filename = `rsvp-export-${date}.csv`;

    // Return CSV response with proper headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("RSVP export error:", error);
    return NextResponse.json(
      { error: "Failed to export RSVP data" },
      { status: 500 }
    );
  }
}
