"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { GuestCard } from "./GuestCard";
import { useRouter } from "next/navigation";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  partyName: string | null;
  partySize: number;
  allowPlusOne: boolean;
}

interface GuestListProps {
  guests: Guest[];
}

/**
 * Guest list component with search and filtering
 */
export function GuestList({ guests }: GuestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Filter guests by name or email (client-side search)
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) {
      return guests;
    }

    const query = searchQuery.toLowerCase().trim();
    return guests.filter((guest) => {
      const nameMatch = guest.name.toLowerCase().includes(query);
      const emailMatch = guest.email?.toLowerCase().includes(query) ?? false;
      return nameMatch || emailMatch;
    });
  }, [guests, searchQuery]);

  // Sort alphabetically by name
  const sortedGuests = useMemo(() => {
    return [...filteredGuests].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [filteredGuests]);

  // Calculate totals
  const totalGuests = guests.length;
  const totalAttendees = guests.reduce((sum, g) => sum + g.partySize, 0);

  const handleGuestDeleted = () => {
    // Refresh the page to get updated list
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Add guest button */}
        <Link
          href="/dashboard/guests/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <UserPlus className="h-5 w-5" />
          Add Guest
        </Link>
      </div>

      {/* Summary stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          <strong>{totalGuests}</strong> {totalGuests === 1 ? "guest" : "guests"}
        </span>
        {totalAttendees !== totalGuests && (
          <span className="text-gray-400">|</span>
        )}
        {totalAttendees !== totalGuests && (
          <span>
            <strong>{totalAttendees}</strong> total attendees
          </span>
        )}
        {searchQuery && sortedGuests.length !== guests.length && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-blue-600">
              Showing {sortedGuests.length} result{sortedGuests.length !== 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>

      {/* Guest list or empty state */}
      {sortedGuests.length > 0 ? (
        <div className="space-y-3">
          {sortedGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onDeleted={handleGuestDeleted}
            />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No guests yet
          </h3>
          <p className="text-gray-500 mb-6">
            Add your first guest to get started building your guest list.
          </p>
          <Link
            href="/dashboard/guests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <UserPlus className="h-5 w-5" />
            Add Your First Guest
          </Link>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No guests match your search.
        </div>
      )}
    </div>
  );
}
