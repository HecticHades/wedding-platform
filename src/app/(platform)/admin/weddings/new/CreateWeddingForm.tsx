"use client"

import { useActionState } from "react"
import { createWeddingSite, type CreateWeddingState } from "./actions"
import { Loader2 } from "lucide-react"

const initialState: CreateWeddingState = { success: false }

export function CreateWeddingForm() {
  const [state, formAction, pending] = useActionState(createWeddingSite, initialState)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
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
              Lowercase letters, numbers, and hyphens only (e.g., alice-and-bob)
            </p>
            {state.fieldErrors?.subdomain && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.subdomain}</p>
            )}
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
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Bob"
            />
            {state.fieldErrors?.partner2Name && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.partner2Name}</p>
            )}
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
              {state.fieldErrors?.coupleEmail && (
                <p className="mt-1 text-sm text-red-600">{state.fieldErrors.coupleEmail}</p>
              )}
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
                placeholder="Min. 8 characters"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
              {state.fieldErrors?.couplePassword && (
                <p className="mt-1 text-sm text-red-600">{state.fieldErrors.couplePassword}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Creating..." : "Create Wedding Site"}
          </button>
        </div>
      </form>
    </div>
  )
}
