"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Users, Lock, Pencil, Trash2 } from "lucide-react";
import type { Event } from "@prisma/client";

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: (eventId: string) => Promise<void>;
}

/**
 * Individual event card displaying event details with edit/delete actions
 */
export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date and time for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(event.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header with name and visibility badge */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
              {event.isPublic ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Users className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <Lock className="h-3 w-3" />
                  Invite Only
                </span>
              )}
            </div>
            {event.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit event"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Event details */}
        <div className="mt-4 space-y-2">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(event.dateTime)}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>
              {formatTime(event.dateTime)}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </span>
          </div>

          {/* Location */}
          {(event.location || event.address) && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                {event.location && <span>{event.location}</span>}
                {event.location && event.address && <br />}
                {event.address && (
                  <span className="text-gray-500">{event.address}</span>
                )}
              </div>
            </div>
          )}

          {/* Dress code */}
          {event.dressCode && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Dress code:</span> {event.dressCode}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900">Delete Event?</h4>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete &quot;{event.name}&quot;? This will also
              remove all guest invitations for this event. This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
