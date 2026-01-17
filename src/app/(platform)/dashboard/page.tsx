import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma, withTenantContext } from "@/lib/db/prisma"

export default async function CoupleDashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant")
  }

  // Use tenant context to scope all queries to this couple's data
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      include: {
        tenant: true,
        guests: {
          select: {
            id: true,
            partySize: true,
          },
        },
        events: {
          orderBy: { dateTime: "asc" },
          select: {
            id: true,
            name: true,
            dateTime: true,
          },
        },
      },
    })
    return { wedding }
  })

  if (!data.wedding) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">No Wedding Found</h1>
        <p className="mt-2 text-gray-600">Please contact support.</p>
      </div>
    )
  }

  const { wedding } = data

  // Calculate stats
  const totalGuests = wedding.guests.length
  const totalAttendees = wedding.guests.reduce((sum, g) => sum + g.partySize, 0)
  const nextEvent = wedding.events[0] // Already sorted by dateTime ascending

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {wedding.partner1Name} & {wedding.partner2Name}
        </h1>
        <p className="text-gray-600">
          Your wedding site: {wedding.tenant.subdomain}.localhost:3000
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Guests</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalGuests}</p>
          <p className="text-sm text-gray-500">
            {totalAttendees !== totalGuests
              ? `${totalAttendees} total attendees`
              : "Total guests added"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Events</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{wedding.events.length}</p>
          <p className="text-sm text-gray-500">
            {nextEvent
              ? `Next: ${nextEvent.name} on ${new Date(nextEvent.dateTime).toLocaleDateString()}`
              : "Events planned"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Wedding Date</h3>
          <p className="mt-2 text-lg font-medium text-gray-700">
            {wedding.weddingDate
              ? new Date(wedding.weddingDate).toLocaleDateString()
              : "Not set"}
          </p>
          <p className="text-sm text-gray-500">Your big day</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/templates"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Choose Template
          </Link>
          <Link
            href="/dashboard/theme"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Customize Theme
          </Link>
          <Link
            href="/dashboard/content"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Edit Content
          </Link>
          <Link
            href="/dashboard/events"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Manage Events
          </Link>
          <Link
            href="/dashboard/guests"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Manage Guests
          </Link>
          <Link
            href="/dashboard/rsvp"
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            View RSVPs
          </Link>
        </div>
      </div>
    </div>
  )
}
