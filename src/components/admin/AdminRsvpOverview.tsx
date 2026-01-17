"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { AdminWeddingRsvpSummary } from "@/app/(platform)/admin/rsvp/actions"

interface AdminRsvpOverviewProps {
  weddings: AdminWeddingRsvpSummary[]
}

type SortKey = keyof AdminWeddingRsvpSummary
type SortDirection = "asc" | "desc"

export function AdminRsvpOverview({ weddings }: AdminRsvpOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("weddingDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Calculate platform-wide summary
  const summary = useMemo(() => {
    const totalWeddings = weddings.length
    const totalGuests = weddings.reduce((sum, w) => sum + w.totalGuests, 0)
    const totalInvitations = weddings.reduce(
      (sum, w) => sum + w.totalInvitations,
      0
    )
    const totalResponded = weddings.reduce((sum, w) => sum + w.responded, 0)
    const averageResponseRate =
      totalInvitations > 0 ? (totalResponded / totalInvitations) * 100 : 0

    return {
      totalWeddings,
      totalGuests,
      totalInvitations,
      totalResponded,
      averageResponseRate,
    }
  }, [weddings])

  // Filter weddings by search query
  const filteredWeddings = useMemo(() => {
    if (!searchQuery.trim()) return weddings

    const query = searchQuery.toLowerCase()
    return weddings.filter(
      (w) =>
        w.coupleNames.toLowerCase().includes(query) ||
        w.subdomain.toLowerCase().includes(query)
    )
  }, [weddings, searchQuery])

  // Sort filtered weddings
  const sortedWeddings = useMemo(() => {
    return [...filteredWeddings].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortDirection === "asc" ? 1 : -1
      if (bValue === null) return sortDirection === "asc" ? -1 : 1

      // Compare values
      let comparison = 0
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue)
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        comparison = aValue === bValue ? 0 : aValue ? -1 : 1
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredWeddings, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500"
    if (rate >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const SortableHeader = ({
    label,
    sortKeyName,
  }: {
    label: string
    sortKeyName: SortKey
  }) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </div>
    </th>
  )

  return (
    <div>
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Weddings</div>
          <div className="text-2xl font-bold text-blue-900">
            {summary.totalWeddings}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Guests</div>
          <div className="text-2xl font-bold text-purple-900">
            {summary.totalGuests}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">
            Total Responses
          </div>
          <div className="text-2xl font-bold text-green-900">
            {summary.totalResponded}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">
            Avg Response Rate
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {summary.averageResponseRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by couple name or subdomain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader label="Subdomain" sortKeyName="subdomain" />
                <SortableHeader label="Couple Names" sortKeyName="coupleNames" />
                <SortableHeader label="Wedding Date" sortKeyName="weddingDate" />
                <SortableHeader label="Guests" sortKeyName="totalGuests" />
                <SortableHeader
                  label="Invitations"
                  sortKeyName="totalInvitations"
                />
                <SortableHeader label="Responded" sortKeyName="responded" />
                <SortableHeader
                  label="Response Rate"
                  sortKeyName="responseRate"
                />
                <SortableHeader label="RSVP Code" sortKeyName="hasRsvpCode" />
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedWeddings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {searchQuery
                      ? "No weddings match your search."
                      : "No weddings with guests yet."}
                  </td>
                </tr>
              ) : (
                sortedWeddings.map((wedding) => (
                  <tr key={wedding.weddingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://${wedding.subdomain}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {wedding.subdomain}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {wedding.coupleNames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wedding.weddingDate
                        ? new Date(wedding.weddingDate).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {wedding.totalGuests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {wedding.totalInvitations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-green-600">{wedding.attending}</span>
                      {" / "}
                      <span className="text-red-600">{wedding.declined}</span>
                      {" / "}
                      <span className="text-gray-400">
                        {wedding.totalInvitations - wedding.responded}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getResponseRateColor(wedding.responseRate)}`}
                            style={{
                              width: `${Math.min(wedding.responseRate, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {wedding.responseRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {wedding.hasRsvpCode ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/weddings/${wedding.weddingId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
