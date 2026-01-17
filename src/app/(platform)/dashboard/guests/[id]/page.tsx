import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { GuestForm } from "@/components/guests/GuestForm";
import Link from "next/link";
import { ChevronRight, Home, Users, Calendar } from "lucide-react";

interface EditGuestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuestPage({ params }: EditGuestPageProps) {
  const { id } = await params;

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch guest with tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    const guest = await prisma.guest.findFirst({
      where: { id },
      include: {
        eventInvitations: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                dateTime: true,
              },
            },
          },
        },
      },
    });
    return { guest };
  });

  if (!data.guest) {
    notFound();
  }

  const guest = data.guest;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/guests" className="hover:text-gray-700 flex items-center gap-1">
          <Users className="h-4 w-4" />
          Guests
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{guest.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Guest</h1>
        <p className="mt-2 text-gray-600">
          Update information for {guest.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guest form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <GuestForm guest={guest} />
          </div>
        </div>

        {/* Event invitations sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Event Invitations
            </h2>

            {guest.eventInvitations.length > 0 ? (
              <ul className="space-y-3">
                {guest.eventInvitations.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.event.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(invitation.event.dateTime).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    {invitation.rsvpStatus && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invitation.rsvpStatus === "ATTENDING"
                            ? "bg-green-100 text-green-700"
                            : invitation.rsvpStatus === "DECLINED"
                            ? "bg-red-100 text-red-700"
                            : invitation.rsvpStatus === "MAYBE"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {invitation.rsvpStatus.toLowerCase()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                This guest has not been invited to any events yet.
              </p>
            )}

            <p className="mt-4 text-xs text-gray-400">
              Event invitations are managed in the Events section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
