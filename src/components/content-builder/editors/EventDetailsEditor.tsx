"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface Event {
  name: string;
  date: string;
  time: string;
  location: string;
  address: string;
  dressCode?: string;
  description?: string;
}

interface EventDetailsEditorProps {
  initialContent: PrismaJson.SectionContent;
}

export function EventDetailsEditor({ initialContent }: EventDetailsEditorProps) {
  // Type guard to ensure we have event-details content
  const typedContent =
    initialContent.type === "event-details"
      ? initialContent
      : { type: "event-details" as const, events: [] };

  const [events, setEvents] = useState<Event[]>(typedContent.events);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addEvent = () => {
    setEvents([
      ...events,
      {
        name: "",
        date: "",
        time: "",
        location: "",
        address: "",
        dressCode: "",
        description: "",
      },
    ]);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const updateEvent = (index: number, field: keyof Event, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    // Basic validation
    const hasEmptyRequired = events.some(
      (e) => !e.name || !e.date || !e.time || !e.location || !e.address
    );
    if (hasEmptyRequired) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields for each event.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.EventDetailsContent = {
        type: "event-details",
        events: events.map((e) => ({
          name: e.name,
          date: e.date,
          time: e.time,
          location: e.location,
          address: e.address,
          ...(e.dressCode && { dressCode: e.dressCode }),
          ...(e.description && { description: e.description }),
        })),
      };

      const result = await updateSectionContent("event-details", content);

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to save");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="h-5 w-5" />
          Changes saved successfully!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* Events list */}
      <div className="space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Event {index + 1}
              </h3>
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove event"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(index, "name", e.target.value)}
                  placeholder="e.g., Wedding Ceremony"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => updateEvent(index, "date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) => updateEvent(index, "time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Dress Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={event.dressCode || ""}
                  onChange={(e) => updateEvent(index, "dressCode", e.target.value)}
                  placeholder="e.g., Black Tie, Cocktail Attire"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={event.location}
                  onChange={(e) => updateEvent(index, "location", e.target.value)}
                  placeholder="e.g., The Grand Ballroom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={event.address}
                  onChange={(e) => updateEvent(index, "address", e.target.value)}
                  placeholder="e.g., 123 Wedding Lane, City, State 12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={event.description || ""}
                  onChange={(e) =>
                    updateEvent(index, "description", e.target.value)
                  }
                  placeholder="Additional details about this event..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add event button */}
      <button
        type="button"
        onClick={addEvent}
        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
      >
        <Plus className="h-5 w-5" />
        Add Event
      </button>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No events added yet.</p>
          <p className="text-sm mt-1">
            Add events like your ceremony, reception, or rehearsal dinner.
          </p>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
