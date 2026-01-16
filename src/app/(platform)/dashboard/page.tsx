import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
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
        guests: true,
        events: true,
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
          <p className="mt-2 text-3xl font-bold text-blue-600">{wedding.guests.length}</p>
          <p className="text-sm text-gray-500">Total guests added</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Events</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{wedding.events.length}</p>
          <p className="text-sm text-gray-500">Events planned</p>
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
          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            Manage Guests (Coming in Phase 4)
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            Edit Content (Coming in Phase 3)
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            View RSVPs (Coming in Phase 5)
          </span>
        </div>
      </div>
    </div>
  )
}
