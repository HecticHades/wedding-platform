"use client"

import { useActionState, useEffect, useState } from "react"
import { updateWeddingDetails, type UpdateWeddingState } from "./actions"
import { Loader2, CheckCircle } from "lucide-react"

interface EditWeddingFormProps {
  wedding: {
    id: string
    partner1Name: string
    partner2Name: string
    weddingDate: Date | null
    tenant: {
      subdomain: string
    }
  }
  coupleEmail: string | null
}

const initialState: UpdateWeddingState = { success: false }

export function EditWeddingForm({ wedding, coupleEmail }: EditWeddingFormProps) {
  const [state, formAction, pending] = useActionState(updateWeddingDetails, initialState)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Wedding Details</h2>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700">Changes saved successfully!</p>
        </div>
      )}

      <form action={formAction}>
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
            {state.fieldErrors?.partner1Name && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.partner1Name}</p>
            )}
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
            {state.fieldErrors?.partner2Name && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.partner2Name}</p>
            )}
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
            {state.fieldErrors?.subdomain && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.subdomain}</p>
            )}
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
                {coupleEmail || "No account linked"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
