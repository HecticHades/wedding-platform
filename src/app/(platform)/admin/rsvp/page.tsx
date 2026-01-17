import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getAdminRsvpOverview } from "./actions"
import { AdminRsvpOverview } from "@/components/admin/AdminRsvpOverview"

export default async function AdminRsvpPage() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  const weddings = await getAdminRsvpOverview()

  // Calculate platform-wide stats for the summary cards
  const totalWeddings = weddings.length
  const weddingsWithRsvps = weddings.filter((w) => w.totalInvitations > 0).length
  const totalGuestsInvited = weddings.reduce(
    (sum, w) => sum + w.totalInvitations,
    0
  )
  const totalResponses = weddings.reduce((sum, w) => sum + w.responded, 0)
  const averageResponseRate =
    totalGuestsInvited > 0 ? (totalResponses / totalGuestsInvited) * 100 : 0

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/admin" className="hover:text-gray-700">
              Admin
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">RSVP Overview</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">RSVP Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor RSVP activity across all weddings on the platform.
        </p>
      </div>

      {/* Platform-wide Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Weddings with RSVPs
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {weddingsWithRsvps}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            of {totalWeddings} total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Total Guests Invited
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {totalGuestsInvited}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            across all events
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Responses</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {totalResponses}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            {totalGuestsInvited - totalResponses} pending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Average Response Rate
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {averageResponseRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-400">platform average</div>
        </div>
      </div>

      {/* RSVP Overview Table */}
      {weddings.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-gray-400 text-lg mb-2">No weddings with guests yet</div>
          <p className="text-sm text-gray-500">
            RSVP data will appear here once couples add guests to their weddings.
          </p>
          <Link
            href="/admin/weddings"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            View all weddings
          </Link>
        </div>
      ) : (
        <AdminRsvpOverview weddings={weddings} />
      )}
    </div>
  )
}
