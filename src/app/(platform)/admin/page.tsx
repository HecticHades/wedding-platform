import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  // Admin operations - no tenant context, see all data
  const [weddingCount, userCount] = await Promise.all([
    prisma.wedding.count(),
    prisma.user.count(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Weddings</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {weddingCount}
          </div>
          <Link
            href="/admin/weddings"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            View all weddings
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {userCount}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">RSVP Overview</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">
            Platform-wide RSVP Stats
          </div>
          <Link
            href="/admin/rsvp"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
          >
            View RSVP overview
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <Link
            href="/admin/weddings/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New Wedding
          </Link>
        </div>
      </div>
    </div>
  )
}
