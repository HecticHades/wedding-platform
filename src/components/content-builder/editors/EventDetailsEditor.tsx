import Link from "next/link";
import { Calendar, MapPin, Clock, Shirt, ArrowRight, CalendarPlus } from "lucide-react";
import type { Event } from "@prisma/client";

interface EventDetailsEditorProps {
  events: Event[];
}

/**
 * Formats a date for display
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a time for display
 */
function formatEventTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * EventDetailsEditor displays events from the Events tab (read-only)
 * and provides a link to manage events in the Events tab.
 *
 * Events are now managed in a single place (Events tab) to avoid
 * having duplicate/conflicting event data.
 */
export function EventDetailsEditor({ events }: EventDetailsEditorProps) {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">
              Events are managed in the Events tab
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              To add, edit, or remove events, go to the Events tab. This section
              will automatically display your events on your wedding website.
            </p>
            <Link
              href="/dashboard/events"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <CalendarPlus className="h-4 w-4" />
              Manage Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Events preview */}
      {events.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Events Preview ({events.length})
          </h3>
          <p className="text-sm text-gray-500">
            These events will be displayed on your wedding website.
          </p>

          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                {/* Event name */}
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {event.name}
                </h4>

                <div className="space-y-2 text-sm text-gray-600">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatEventDate(event.dateTime)}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatEventTime(event.dateTime)}
                      {event.endTime && ` - ${formatEventTime(event.endTime)}`}
                    </span>
                  </div>

                  {/* Location */}
                  {(event.location || event.address) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        {event.location && <span className="font-medium">{event.location}</span>}
                        {event.location && event.address && <span> · </span>}
                        {event.address && <span>{event.address}</span>}
                      </div>
                    </div>
                  )}

                  {/* Dress code */}
                  {event.dressCode && (
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4 text-gray-400" />
                      <span>Dress Code: {event.dressCode}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="mt-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
                    {event.description}
                  </p>
                )}

                {/* Visibility indicator */}
                {!event.isPublic && (
                  <div className="mt-3 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Private Event (Invited Guests Only)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven&apos;t created any events yet. Add events like your ceremony,
            reception, or rehearsal dinner to display them on your wedding website.
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  );
}
