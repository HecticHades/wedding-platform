"use client"

import { useState } from "react"
import { Globe } from "lucide-react"

interface DomainConfigFormProps {
  onAdd: (domain: string) => Promise<{
    success: boolean
    error?: string
  }>
}

export function DomainConfigForm({ onAdd }: DomainConfigFormProps) {
  const [domain, setDomain] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Basic client-side validation
    const trimmedDomain = domain.trim().toLowerCase()
    if (!trimmedDomain) {
      setError("Please enter a domain")
      setIsSubmitting(false)
      return
    }

    // Remove protocol if accidentally included
    const cleanDomain = trimmedDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")

    try {
      const result = await onAdd(cleanDomain)
      if (!result.success) {
        setError(result.error || "Failed to add domain")
      } else {
        setDomain("")
      }
    } catch {
      setError("Failed to add domain. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Custom Domain
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourwedding.com"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter the domain you own, e.g., yourwedding.com or www.yourwedding.com
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !domain.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding Domain..." : "Add Custom Domain"}
      </button>
    </form>
  )
}
