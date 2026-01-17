"use client";

import { useState, useMemo } from "react";
import { EventRsvpForm } from "@/components/rsvp/EventRsvpForm";
import { RsvpConfirmation } from "@/components/rsvp/RsvpConfirmation";
import type { RsvpStatus } from "@prisma/client";

interface MealOption {
  id: string;
  name: string;
  description?: string;
}

interface EventData {
  id: string;
  name: string;
  description: string | null;
  dateTime: Date;
  endTime: Date | null;
  location: string | null;
  address: string | null;
  dressCode: string | null;
  mealOptions: MealOption[];
  currentRsvp?: {
    rsvpStatus: RsvpStatus | null;
    rsvpAt: Date | null;
    plusOneCount: number | null;
    plusOneName: string | null;
    mealChoice: string | null;
    dietaryNotes: string | null;
  };
}

interface RsvpFormPageProps {
  guestId: string;
  guestName: string;
  coupleNames: string;
  allowPlusOne: boolean;
  events: EventData[];
  domain: string;
}

export function RsvpFormPage({
  guestId,
  guestName,
  coupleNames,
  allowPlusOne,
  events,
  domain,
}: RsvpFormPageProps) {
  // Track which events have been responded to in this session
  const [respondedEvents, setRespondedEvents] = useState<Set<string>>(
    new Set(
      events
        .filter((e) => e.currentRsvp?.rsvpStatus)
        .map((e) => e.id)
    )
  );

  // Count events with responses (including new submissions)
  const respondedCount = respondedEvents.size;
  const totalEvents = events.length;
  const allResponded = respondedCount >= totalEvents;

  // Show confirmation if all events have been responded to
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Memoize sorted events by date
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
      ),
    [events]
  );

  function handleEventSubmitted(eventId: string) {
    setRespondedEvents((prev) => new Set([...prev, eventId]));

    // Check if this was the last event to respond to
    const newRespondedCount = respondedEvents.size + 1;
    if (newRespondedCount >= totalEvents) {
      // Show confirmation after a brief delay
      setTimeout(() => setShowConfirmation(true), 500);
    }
  }

  // Show confirmation screen
  if (showConfirmation && allResponded) {
    return (
      <div className="space-y-6">
        <RsvpConfirmation
          guestName={guestName}
          coupleNames={coupleNames}
          eventsCount={totalEvents}
          domain={domain}
        />

        {/* Option to review/change responses */}
        <div className="text-center">
          <button
            onClick={() => setShowConfirmation(false)}
            className="font-wedding text-sm text-wedding-primary hover:text-wedding-primary/80 underline transition-colors"
          >
            Review or update your responses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-wedding-primary/10">
        <div className="flex items-center justify-between mb-2">
          <span className="font-wedding text-sm text-wedding-text/70">
            Response Progress
          </span>
          <span className="font-wedding text-sm font-medium text-wedding-primary">
            {respondedCount} of {totalEvents} events
          </span>
        </div>
        <div className="w-full bg-wedding-primary/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-wedding-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${(respondedCount / totalEvents) * 100}%` }}
          />
        </div>
        {allResponded && (
          <p className="font-wedding text-xs text-green-600 mt-2">
            All events responded! You can still update your responses below.
          </p>
        )}
      </div>

      {/* Event RSVP Forms */}
      {sortedEvents.map((event) => (
        <EventRsvpForm
          key={event.id}
          event={event}
          guestId={guestId}
          allowPlusOne={allowPlusOne}
          currentRsvp={event.currentRsvp}
          onSubmitted={() => handleEventSubmitted(event.id)}
        />
      ))}

      {/* View All Responses Button */}
      {allResponded && !showConfirmation && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowConfirmation(true)}
            className="bg-wedding-primary hover:bg-wedding-primary/90 text-white font-wedding py-3 px-8 rounded-lg transition-colors"
          >
            View Confirmation
          </button>
        </div>
      )}
    </div>
  );
}
