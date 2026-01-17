"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import type { Event } from "@prisma/client";
import { createEvent, updateEvent } from "@/app/(platform)/dashboard/events/actions";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

/**
 * Event form component for creating and editing events
 */
export function EventForm({ event, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!event;

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (date: Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      let result;

      if (isEditing) {
        result = await updateEvent(event.id, formData);
      } else {
        result = await createEvent(formData);
      }

      if (result.success) {
        onSuccess?.();
        router.push("/dashboard/events");
        router.refresh();
      } else {
        setError(result.error ?? "An error occurred");
      }
    });
  };

  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  return (
    <form action={handleSubmit} className="space-y-6">
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

      {/* Event Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={event?.name || ""}
          required
          placeholder="e.g., Wedding Ceremony, Reception, Rehearsal Dinner"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Date and Time row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="dateTime"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            defaultValue={formatDateTimeLocal(event?.dateTime)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700"
          >
            End Time
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            defaultValue={formatDateTimeLocal(event?.endTime)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Location row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Venue Name
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={event?.location || ""}
            placeholder="e.g., The Grand Ballroom"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={event?.address || ""}
            placeholder="e.g., 123 Main St, City, State 12345"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Dress Code */}
      <div>
        <label
          htmlFor="dressCode"
          className="block text-sm font-medium text-gray-700"
        >
          Dress Code
        </label>
        <input
          type="text"
          id="dressCode"
          name="dressCode"
          defaultValue={event?.dressCode || ""}
          placeholder="e.g., Black Tie, Cocktail Attire, Semi-Formal"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={event?.description || ""}
          placeholder="Add any additional details about this event..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Visibility toggle */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          value="true"
          defaultChecked={event?.isPublic ?? true}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <label
            htmlFor="isPublic"
            className="block text-sm font-medium text-gray-700"
          >
            Public Event
          </label>
          <p className="text-sm text-gray-500">
            Public events are visible to all guests. Uncheck this to make the
            event invite-only.
          </p>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}
