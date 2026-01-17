"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Event } from "@prisma/client";
import { EventCard } from "./EventCard";
import { deleteEvent } from "@/app/(platform)/dashboard/events/actions";

interface EventListProps {
  events: Event[];
}

/**
 * Event list component displaying all events with search/filter capability
 */
export function EventList({ events }: EventListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filter events by name
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}`);
  };

  const handleDelete = async (eventId: string) => {
    setError(null);
    const result = await deleteEvent(eventId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      setError(result.error ?? "Failed to delete event");
    }
  };

  // Empty state
  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No events yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Create your first event to get started.
        </p>
        <Link
          href="/dashboard/events/new"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header with count and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {filteredEvents.length} of {events.length} event
          {events.length !== 1 ? "s" : ""}
        </p>

        {/* Search input */}
        {events.length > 3 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Event cards */}
      <div className={`space-y-4 ${isPending ? "opacity-50" : ""}`}>
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => handleEdit(event.id)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* No results from search */}
      {filteredEvents.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">
            No events match &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
