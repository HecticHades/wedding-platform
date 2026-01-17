import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight, Home, Download, Mail } from "lucide-react";
import { RsvpDashboard } from "@/components/rsvp/RsvpDashboard";
import { RsvpGuestList } from "@/components/rsvp/RsvpGuestList";
import { getRsvpStats, getRsvpStatsPerEvent } from "@/lib/rsvp/rsvp-utils";
import { getRsvpGuestList } from "./actions";

export default async function RsvpDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch all data with tenant context
  const tenantId = session.user.tenantId;

  // Get stats and guest list in parallel
  const [stats, perEventStats, guests, wedding] = await Promise.all([
    getRsvpStats(tenantId),
    getRsvpStatsPerEvent(tenantId),
    getRsvpGuestList(tenantId),
    withTenantContext(tenantId, async () => {
      return prisma.wedding.findFirst({
        select: {
          rsvpCode: true,
          tenant: {
            select: { subdomain: true },
          },
        },
      });
    }),
  ]);

  if (!wedding) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">No Wedding Found</h1>
        <p className="mt-2 text-gray-600">Please contact support.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">RSVPs</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RSVP Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track responses, view guest details, and manage your RSVP settings.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/rsvp/export"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
          <Link
            href="/dashboard/rsvp/reminders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Mail className="h-4 w-4" />
            Send Reminders
          </Link>
        </div>
      </div>

      {/* Dashboard Stats and Code */}
      <RsvpDashboard
        stats={stats}
        perEventStats={perEventStats}
        currentRsvpCode={wedding.rsvpCode}
        subdomain={wedding.tenant.subdomain}
      />

      {/* Guest Response List */}
      <div className="mt-8">
        <RsvpGuestList guests={guests} />
      </div>
    </div>
  );
}
