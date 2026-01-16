import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { updateWeddingDetails } from "./actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminWeddingDetailPage({ params }: Props) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  const { id } = await params

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      tenant: true,
    },
  })

  if (!wedding) {
    notFound()
  }

  // Find the couple user for this wedding
  const coupleUser = await prisma.user.findFirst({
    where: { tenantId: wedding.tenantId, role: "couple" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/weddings"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            &larr; Back to Weddings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>
          <p className="text-gray-600">Subdomain: {wedding.tenant.subdomain}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Wedding Details</h2>

        <form action={updateWeddingDetails}>
          <input type="hidden" name="weddingId" value={wedding.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="partner1Name"
                className="block text-sm font-medium text-gray-700"
              >
                Partner 1 Name
              </label>
              <input
                type="text"
                id="partner1Name"
                name="partner1Name"
                defaultValue={wedding.partner1Name}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="partner2Name"
                className="block text-sm font-medium text-gray-700"
              >
                Partner 2 Name
              </label>
              <input
                type="text"
                id="partner2Name"
                name="partner2Name"
                defaultValue={wedding.partner2Name}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="weddingDate"
                className="block text-sm font-medium text-gray-700"
              >
                Wedding Date
              </label>
              <input
                type="date"
                id="weddingDate"
                name="weddingDate"
                defaultValue={
                  wedding.weddingDate
                    ? new Date(wedding.weddingDate).toISOString().split("T")[0]
                    : ""
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="subdomain"
                className="block text-sm font-medium text-gray-700"
              >
                Subdomain
              </label>
              <input
                type="text"
                id="subdomain"
                name="subdomain"
                defaultValue={wedding.tenant.subdomain}
                pattern="^[a-z0-9-]+$"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Couple Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Couple Email
                </label>
                <p className="mt-1 text-gray-900">
                  {coupleUser?.email || "No account linked"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
