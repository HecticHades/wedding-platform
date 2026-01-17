"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Clock,
} from "lucide-react";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
}

interface TimelineEditorProps {
  initialContent: PrismaJson.SectionContent;
}

export function TimelineEditor({ initialContent }: TimelineEditorProps) {
  // Type guard to ensure we have timeline content
  const typedContent =
    initialContent.type === "timeline"
      ? initialContent
      : { type: "timeline" as const, title: "Wedding Day Timeline", events: [] };

  const [title, setTitle] = useState(typedContent.title);
  const [events, setEvents] = useState<TimelineEvent[]>(typedContent.events);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addEvent = () => {
    setEvents([
      ...events,
      {
        time: "",
        title: "",
        description: "",
      },
    ]);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const updateEvent = (
    index: number,
    field: keyof TimelineEvent,
    value: string
  ) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const moveEvent = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === events.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...events];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setEvents(updated);
  };

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a title for the timeline.");
      return;
    }

    const hasEmptyRequired = events.some((e) => !e.time || !e.title);
    if (hasEmptyRequired) {
      setStatus("error");
      setErrorMessage("Please fill in the time and title for each event.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.TimelineContent = {
        type: "timeline",
        title: title.trim(),
        events: events.map((e) => ({
          time: e.time,
          title: e.title,
          ...(e.description && { description: e.description }),
        })),
      };

      const result = await updateSectionContent("timeline", content);

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

      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Wedding Day Schedule, Day-of Timeline"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Events section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule</h2>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col justify-center gap-1">
                <button
                  type="button"
                  onClick={() => moveEvent(index, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveEvent(index, "down")}
                  disabled={index === events.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Event fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Time */}
                <div className="md:col-span-3">
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

                {/* Title */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => updateEvent(index, "title", e.target.value)}
                    placeholder="e.g., Ceremony Begins"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={event.description || ""}
                    onChange={(e) =>
                      updateEvent(index, "description", e.target.value)
                    }
                    placeholder="e.g., In the garden pavilion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Delete button */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => removeEvent(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove event"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add event button */}
          <button
            type="button"
            onClick={addEvent}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Schedule Event
          </button>

          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events in the schedule yet.</p>
              <p className="text-sm mt-1">
                Add events like ceremony start time, cocktail hour, dinner, etc.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick add suggestions */}
      {events.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Common Events</h3>
          <p className="text-sm text-blue-700 mb-3">
            Click to quickly add common wedding day events:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { time: "16:00", title: "Ceremony" },
              { time: "17:00", title: "Cocktail Hour" },
              { time: "18:00", title: "Reception" },
              { time: "18:30", title: "Dinner" },
              { time: "20:00", title: "First Dance" },
              { time: "21:00", title: "Cake Cutting" },
            ].map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                onClick={() =>
                  setEvents([
                    ...events,
                    { time: suggestion.time, title: suggestion.title },
                  ])
                }
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                + {suggestion.title}
              </button>
            ))}
          </div>
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
