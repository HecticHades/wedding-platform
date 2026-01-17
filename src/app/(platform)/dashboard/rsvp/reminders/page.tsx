import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ChevronRight, Home, Mail, ArrowLeft } from "lucide-react";
import { SendRemindersForm } from "./SendRemindersForm";

export default async function RemindersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const tenantId = session.user.tenantId;

  // Get count of guests with pending RSVPs who have email
  const pendingData = await withTenantContext(tenantId, async () => {
    const guests = await prisma.guest.findMany({
      where: {
        email: { not: null },
        eventInvitations: {
          some: {
            rsvpStatus: null,
          },
        },
      },
      include: {
        eventInvitations: {
          where: {
            rsvpStatus: null,
          },
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

    return guests.map((g) => ({
      name: g.name,
      email: g.email!,
      pendingEvents: g.eventInvitations.map((inv) => inv.event.name),
    }));
  });

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/rsvp" className="hover:text-gray-700">
          RSVPs
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Send Reminders</span>
      </nav>

      {/* Back link */}
      <Link
        href="/dashboard/rsvp"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to RSVP Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="h-8 w-8 text-green-600" />
          Send RSVP Reminders
        </h1>
        <p className="mt-2 text-gray-600">
          Send reminder emails to guests who haven&apos;t responded yet.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        {pendingData.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No Reminders to Send
            </h2>
            <p className="text-gray-600">
              All guests with email addresses have already responded to their invitations.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Send
              </h2>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold text-green-600">
                  {pendingData.length} guest{pendingData.length === 1 ? "" : "s"}
                </span>{" "}
                will receive a reminder email about events they haven&apos;t responded to.
              </p>
            </div>

            {/* Preview list */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Recipients Preview
              </h3>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {pendingData.slice(0, 10).map((guest) => (
                  <div key={guest.email} className="px-4 py-3">
                    <div className="font-medium text-gray-900">{guest.name}</div>
                    <div className="text-sm text-gray-500">{guest.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Pending: {guest.pendingEvents.join(", ")}
                    </div>
                  </div>
                ))}
                {pendingData.length > 10 && (
                  <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                    ...and {pendingData.length - 10} more
                  </div>
                )}
              </div>
            </div>

            {/* Send form */}
            <SendRemindersForm guestCount={pendingData.length} />
          </>
        )}
      </div>
    </div>
  );
}
