import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createWeddingSite } from "./actions"

export default async function CreateWeddingPage() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/weddings"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          &larr; Back to Weddings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Create New Wedding
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form action={createWeddingSite} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="subdomain"
                className="block text-sm font-medium text-gray-700"
              >
                Subdomain
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="subdomain"
                  name="subdomain"
                  required
                  minLength={3}
                  maxLength={63}
                  pattern="^[a-z0-9-]+$"
                  className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="alice-and-bob"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only (e.g.,
                alice-and-bob)
              </p>
            </div>

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
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Alice"
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
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Bob"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Couple Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="coupleEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Couple Email
                </label>
                <input
                  type="email"
                  id="coupleEmail"
                  name="coupleEmail"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="alice.bob@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="couplePassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Couple Password
                </label>
                <input
                  type="password"
                  id="couplePassword"
                  name="couplePassword"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Wedding Site
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
