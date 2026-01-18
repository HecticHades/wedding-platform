"use client";

import { useState, useTransition } from "react";
import { submitRsvp } from "@/app/[domain]/rsvp/[guestId]/actions";
import type { RsvpStatus } from "@prisma/client";
import {
  Calendar,
  MapPin,
  Shirt,
  Check,
  Loader2,
  UserPlus,
  Utensils,
  AlertCircle,
} from "lucide-react";
import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedButton } from "@/components/theme/ThemedButton";

interface MealOption {
  id: string;
  name: string;
  description?: string;
}

interface EventRsvpFormProps {
  event: {
    id: string;
    name: string;
    description: string | null;
    dateTime: Date;
    endTime: Date | null;
    location: string | null;
    address: string | null;
    dressCode: string | null;
    mealOptions: MealOption[];
  };
  guestId: string;
  allowPlusOne: boolean;
  currentRsvp?: {
    rsvpStatus: RsvpStatus | null;
    rsvpAt: Date | null;
    plusOneCount: number | null;
    plusOneName: string | null;
    mealChoice: string | null;
    dietaryNotes: string | null;
  };
  onSubmitted: () => void;
}

export function EventRsvpForm({
  event,
  guestId,
  allowPlusOne,
  currentRsvp,
  onSubmitted,
}: EventRsvpFormProps) {
  const [rsvpStatus, setRsvpStatus] = useState<"ATTENDING" | "DECLINED" | "">(
    currentRsvp?.rsvpStatus === "ATTENDING" || currentRsvp?.rsvpStatus === "DECLINED"
      ? currentRsvp.rsvpStatus
      : ""
  );
  const [plusOneCount, setPlusOneCount] = useState(
    currentRsvp?.plusOneCount ?? 0
  );
  const [plusOneName, setPlusOneName] = useState(
    currentRsvp?.plusOneName ?? ""
  );
  const [mealChoice, setMealChoice] = useState(currentRsvp?.mealChoice ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(
    currentRsvp?.dietaryNotes ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAttending = rsvpStatus === "ATTENDING";
  const hasMealOptions = event.mealOptions.length > 0;
  const hasResponded = !!currentRsvp?.rsvpStatus;

  // Format date
  const formattedDate = new Date(event.dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(event.dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!rsvpStatus) {
      setError("Please select your response");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("eventId", event.id);
      formData.set("rsvpStatus", rsvpStatus);
      if (allowPlusOne && isAttending) {
        formData.set("plusOneCount", String(plusOneCount));
        formData.set("plusOneName", plusOneName);
      }
      if (hasMealOptions && isAttending) {
        formData.set("mealChoice", mealChoice);
      }
      if (isAttending) {
        formData.set("dietaryNotes", dietaryNotes);
      }

      const result = await submitRsvp(guestId, formData);

      if (result.success) {
        onSubmitted();
      } else {
        setError(result.error ?? "Failed to submit RSVP");
      }
    });
  }

  return (
    <ThemedCard variant="glass" className="overflow-hidden">
      {/* Event Header */}
      <div className="bg-wedding-primary/5 px-6 py-4 border-b border-wedding-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="font-wedding-heading text-xl text-wedding-primary">
            {event.name}
          </h3>
          {hasResponded && (
            <span className="inline-flex items-center gap-1 text-sm font-wedding text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <Check className="w-4 h-4" />
              Responded
            </span>
          )}
        </div>
        {event.description && (
          <p className="font-wedding text-sm text-wedding-text/70 mt-1">
            {event.description}
          </p>
        )}
      </div>

      {/* Event Details */}
      <div className="px-6 py-4 space-y-2 border-b border-wedding-primary/10">
        <div className="flex items-center gap-3 text-wedding-text/80">
          <Calendar className="w-4 h-4 text-wedding-primary" />
          <span className="font-wedding text-sm">
            {formattedDate} at {formattedTime}
          </span>
        </div>
        {event.location && (
          <div className="flex items-start gap-3 text-wedding-text/80">
            <MapPin className="w-4 h-4 text-wedding-primary mt-0.5" />
            <div className="font-wedding text-sm">
              <p>{event.location}</p>
              {event.address && (
                <p className="text-wedding-text/60">{event.address}</p>
              )}
            </div>
          </div>
        )}
        {event.dressCode && (
          <div className="flex items-center gap-3 text-wedding-text/80">
            <Shirt className="w-4 h-4 text-wedding-primary" />
            <span className="font-wedding text-sm">
              Dress code: {event.dressCode}
            </span>
          </div>
        )}
      </div>

      {/* RSVP Form */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
        {/* Attendance Selection */}
        <div>
          <label className="block font-wedding text-sm font-medium text-wedding-text mb-3">
            Will you be attending?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRsvpStatus("ATTENDING")}
              className={`flex-1 py-3 px-4 border-2 font-wedding text-sm transition-all ${
                rsvpStatus === "ATTENDING"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-wedding-primary/20 hover:border-wedding-primary/40 text-wedding-text/70"
              }`}
              style={{ borderRadius: "var(--wedding-radius)" }}
            >
              Joyfully Accept
            </button>
            <button
              type="button"
              onClick={() => setRsvpStatus("DECLINED")}
              className={`flex-1 py-3 px-4 border-2 font-wedding text-sm transition-all ${
                rsvpStatus === "DECLINED"
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-wedding-primary/20 hover:border-wedding-primary/40 text-wedding-text/70"
              }`}
              style={{ borderRadius: "var(--wedding-radius)" }}
            >
              Regretfully Decline
            </button>
          </div>
        </div>

        {/* Plus-One Section (only if allowed and attending) */}
        {allowPlusOne && isAttending && (
          <div className="space-y-4 pt-4 border-t border-wedding-primary/10">
            <div className="flex items-center gap-2 text-wedding-primary">
              <UserPlus className="w-4 h-4" />
              <span className="font-wedding text-sm font-medium">
                Additional Guests
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`plusOneCount-${event.id}`}
                  className="block font-wedding text-sm text-wedding-text/70 mb-1"
                >
                  Number of guests
                </label>
                <select
                  id={`plusOneCount-${event.id}`}
                  value={plusOneCount}
                  onChange={(e) => setPlusOneCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-wedding-primary/20 font-wedding text-wedding-text focus:outline-none focus:ring-2 focus:ring-wedding-primary/30"
                  style={{ borderRadius: "var(--wedding-radius)" }}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={`plusOneName-${event.id}`}
                  className="block font-wedding text-sm text-wedding-text/70 mb-1"
                >
                  Guest name(s)
                </label>
                <input
                  type="text"
                  id={`plusOneName-${event.id}`}
                  value={plusOneName}
                  onChange={(e) => setPlusOneName(e.target.value)}
                  placeholder="Guest names"
                  className="w-full px-3 py-2 border border-wedding-primary/20 font-wedding text-wedding-text placeholder:text-wedding-text/40 focus:outline-none focus:ring-2 focus:ring-wedding-primary/30"
                  style={{ borderRadius: "var(--wedding-radius)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Meal Selection (only if options exist and attending) */}
        {hasMealOptions && isAttending && (
          <div className="space-y-3 pt-4 border-t border-wedding-primary/10">
            <div className="flex items-center gap-2 text-wedding-primary">
              <Utensils className="w-4 h-4" />
              <span className="font-wedding text-sm font-medium">
                Meal Selection
              </span>
            </div>
            <div className="space-y-2">
              {event.mealOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all ${
                    mealChoice === option.id
                      ? "border-wedding-primary bg-wedding-primary/5"
                      : "border-wedding-primary/10 hover:border-wedding-primary/30"
                  }`}
                  style={{ borderRadius: "var(--wedding-radius)" }}
                >
                  <input
                    type="radio"
                    name={`mealChoice-${event.id}`}
                    value={option.id}
                    checked={mealChoice === option.id}
                    onChange={(e) => setMealChoice(e.target.value)}
                    className="mt-1 text-wedding-primary focus:ring-wedding-primary"
                  />
                  <div>
                    <span className="font-wedding text-sm font-medium text-wedding-text">
                      {option.name}
                    </span>
                    {option.description && (
                      <p className="font-wedding text-xs text-wedding-text/60 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Restrictions (only if attending) */}
        {isAttending && (
          <div className="pt-4 border-t border-wedding-primary/10">
            <label
              htmlFor={`dietaryNotes-${event.id}`}
              className="block font-wedding text-sm font-medium text-wedding-text mb-2"
            >
              Dietary restrictions or allergies
            </label>
            <textarea
              id={`dietaryNotes-${event.id}`}
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="Please let us know of any dietary restrictions or allergies..."
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 border border-wedding-primary/20 font-wedding text-wedding-text placeholder:text-wedding-text/40 focus:outline-none focus:ring-2 focus:ring-wedding-primary/30 resize-none"
              style={{ borderRadius: "var(--wedding-radius)" }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3"
            style={{ borderRadius: "var(--wedding-radius)" }}
          >
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="font-wedding text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <ThemedButton
          type="submit"
          disabled={isPending || !rsvpStatus}
          fullWidth
          isLoading={isPending}
        >
          {isPending
            ? "Saving..."
            : hasResponded
              ? "Update Response"
              : "Submit Response"}
        </ThemedButton>
      </form>
    </ThemedCard>
  );
}
