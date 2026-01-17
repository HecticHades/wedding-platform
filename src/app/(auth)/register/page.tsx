"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registerCouple, type RegisterState } from "./actions"

const initialState: RegisterState = { success: false }

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerCouple, initialState)

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Your Wedding Site</h1>
        <p className="text-gray-600 mt-2">Get started with your free wedding website</p>
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="partner1Name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name
            </label>
            <input
              type="text"
              id="partner1Name"
              name="partner1Name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Alex"
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
              Partner&apos;s Name
            </label>
            <input
              type="text"
              id="partner2Name"
              name="partner2Name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Jordan"
            />
            {state.fieldErrors?.partner2Name && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.partner2Name}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="subdomain"
            className="block text-sm font-medium text-gray-700"
          >
            Wedding Site URL
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              required
              pattern="^[a-z0-9-]+$"
              className="block w-full rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="alex-and-jordan"
            />
            <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              .weddinghub.com
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
          {state.fieldErrors?.subdomain && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.subdomain}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Min. 8 characters"
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Creating..." : "Create Wedding Site"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
