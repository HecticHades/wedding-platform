"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, User } from "lucide-react";
import type { RsvpGuest } from "@/app/(platform)/dashboard/rsvp/actions";

type StatusFilter = "all" | "attending" | "declined" | "pending";

interface RsvpGuestListProps {
  guests: RsvpGuest[];
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        Pending
      </span>
    );
  }

  switch (status) {
    case "ATTENDING":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Attending
        </span>
      );
    case "DECLINED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Declined
        </span>
      );
    case "MAYBE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Maybe
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

/**
 * RSVP Guest list with filtering and expandable rows
 */
export function RsvpGuestList({ guests }: RsvpGuestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedGuest, setExpandedGuest] = useState<string | null>(null);

  // Get overall status for a guest based on their event responses
  function getGuestOverallStatus(guest: RsvpGuest): "attending" | "declined" | "pending" | "mixed" {
    if (guest.eventResponses.length === 0) return "pending";

    const hasAttending = guest.eventResponses.some((r) => r.rsvpStatus === "ATTENDING");
    const hasDeclined = guest.eventResponses.some((r) => r.rsvpStatus === "DECLINED");
    const hasPending = guest.eventResponses.some((r) => r.rsvpStatus === null);

    if (hasAttending && (hasDeclined || hasPending)) return "mixed";
    if (hasAttending) return "attending";
    if (hasDeclined) return "declined";
    return "pending";
  }

  // Filter guests based on search and status
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = guest.name.toLowerCase().includes(query);
        const partyMatch = guest.partyName?.toLowerCase().includes(query) ?? false;
        const emailMatch = guest.email?.toLowerCase().includes(query) ?? false;
        if (!nameMatch && !partyMatch && !emailMatch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const overallStatus = getGuestOverallStatus(guest);
        if (statusFilter === "attending" && overallStatus !== "attending" && overallStatus !== "mixed") {
          return false;
        }
        if (statusFilter === "declined" && overallStatus !== "declined") {
          return false;
        }
        if (statusFilter === "pending" && overallStatus !== "pending") {
          return false;
        }
      }

      return true;
    });
  }, [guests, searchQuery, statusFilter]);

  // Sort alphabetically
  const sortedGuests = useMemo(() => {
    return [...filteredGuests].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [filteredGuests]);

  function toggleGuest(guestId: string) {
    setExpandedGuest((prev) => (prev === guestId ? null : guestId));
  }

  // Calculate filter counts
  const attendingCount = guests.filter((g) => {
    const status = getGuestOverallStatus(g);
    return status === "attending" || status === "mixed";
  }).length;
  const declinedCount = guests.filter((g) => getGuestOverallStatus(g) === "declined").length;
  const pendingCount = guests.filter((g) => getGuestOverallStatus(g) === "pending").length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Guest Responses</h3>
        <p className="text-sm text-gray-500 mt-1">
          View individual guest RSVP responses
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, party, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({guests.length})
          </button>
          <button
            onClick={() => setStatusFilter("attending")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === "attending"
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            Attending ({attendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("declined")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === "declined"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            Declined ({declinedCount})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Guest List */}
      <div className="divide-y divide-gray-200">
        {sortedGuests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {guests.length === 0 ? (
              <>
                <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No guests have been invited to events yet.</p>
              </>
            ) : (
              <p>No guests match your search criteria.</p>
            )}
          </div>
        ) : (
          sortedGuests.map((guest) => {
            const isExpanded = expandedGuest === guest.id;
            const hasMultipleEvents = guest.eventResponses.length > 1;
            const primaryResponse = guest.eventResponses[0];

            return (
              <div key={guest.id}>
                {/* Guest Row */}
                <button
                  onClick={() => hasMultipleEvents && toggleGuest(guest.id)}
                  disabled={!hasMultipleEvents}
                  className={`w-full px-6 py-4 text-left flex items-center gap-4 ${
                    hasMultipleEvents ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                  }`}
                >
                  {/* Avatar placeholder */}
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>

                  {/* Name and party */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                    {guest.partyName && (
                      <p className="text-sm text-gray-500 truncate">{guest.partyName}</p>
                    )}
                  </div>

                  {/* Contact info (hidden on mobile) */}
                  <div className="hidden md:block text-sm text-gray-500 w-48 truncate">
                    {guest.email || guest.phone || "-"}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {primaryResponse && (
                      <StatusBadge status={primaryResponse.rsvpStatus} />
                    )}
                    {hasMultipleEvents && (
                      <span className="text-xs text-gray-400">
                        +{guest.eventResponses.length - 1} events
                      </span>
                    )}
                  </div>

                  {/* Expand icon */}
                  {hasMultipleEvents && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded Event Details */}
                {isExpanded && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="ml-14 space-y-3">
                      {guest.eventResponses.map((response) => (
                        <div
                          key={response.eventId}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{response.eventName}</h5>
                            <StatusBadge status={response.rsvpStatus} />
                          </div>
                          {response.rsvpStatus === "ATTENDING" && (
                            <div className="text-sm text-gray-600 space-y-1">
                              {response.plusOneCount !== null && response.plusOneCount > 0 && (
                                <p>+ {response.plusOneCount} guest{response.plusOneCount > 1 ? "s" : ""}</p>
                              )}
                              {response.mealChoice && (
                                <p>Meal: {response.mealChoice}</p>
                              )}
                              {response.dietaryNotes && (
                                <p className="text-gray-500">Dietary: {response.dietaryNotes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single event details (when not expandable) */}
                {!hasMultipleEvents && primaryResponse?.rsvpStatus === "ATTENDING" && (
                  <div className="px-6 pb-4 ml-14 text-sm text-gray-600 space-x-4">
                    {primaryResponse.plusOneCount !== null && primaryResponse.plusOneCount > 0 && (
                      <span>+ {primaryResponse.plusOneCount} guest{primaryResponse.plusOneCount > 1 ? "s" : ""}</span>
                    )}
                    {primaryResponse.mealChoice && (
                      <span>Meal: {primaryResponse.mealChoice}</span>
                    )}
                    {primaryResponse.dietaryNotes && (
                      <span className="text-gray-500">Dietary: {primaryResponse.dietaryNotes}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer with count */}
      {sortedGuests.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {sortedGuests.length} of {guests.length} guests
        </div>
      )}
    </div>
  );
}
