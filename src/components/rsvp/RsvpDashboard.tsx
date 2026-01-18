"use client";

import { useState, useTransition } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Utensils,
  ExternalLink,
} from "lucide-react";
import { setRsvpCode } from "@/app/(platform)/dashboard/rsvp/actions";
import type { RsvpStats, EventRsvpStats } from "@/lib/rsvp/rsvp-utils";
import { getTenantUrl, getTenantUrlDisplay } from "@/lib/url-utils";

interface RsvpDashboardProps {
  stats: RsvpStats;
  perEventStats: EventRsvpStats[];
  currentRsvpCode: string | null;
  subdomain: string;
}

/**
 * RSVP dashboard with statistics and code management
 */
export function RsvpDashboard({
  stats,
  perEventStats,
  currentRsvpCode,
  subdomain,
}: RsvpDashboardProps) {
  const [rsvpCode, setRsvpCodeValue] = useState(currentRsvpCode ?? "");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(
    perEventStats[0]?.eventId ?? null
  );

  // Calculate response rate
  const responseRate = stats.totalInvited > 0
    ? Math.round((stats.totalResponded / stats.totalInvited) * 100)
    : 0;

  // RSVP link
  const rsvpLink = getTenantUrlDisplay(subdomain, "/rsvp");
  const rsvpFullUrl = getTenantUrl(subdomain, "/rsvp");

  function handleCopy() {
    navigator.clipboard.writeText(rsvpLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await setRsvpCode(rsvpCode);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  function toggleEvent(eventId: string) {
    setExpandedEvent((prev) => (prev === eventId ? null : eventId));
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invited */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invited</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvited}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {stats.totalResponded} responded ({responseRate}%)
          </div>
        </div>

        {/* Attending */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Attending</p>
              <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {stats.totalHeadcount} total headcount (with +1s)
          </div>
        </div>

        {/* Declined */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Declined</p>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Awaiting response
          </div>
        </div>
      </div>

      {/* RSVP Code Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RSVP Access Code</h3>
        <p className="text-sm text-gray-600 mb-4">
          Guests will enter this code to access the RSVP page. Share your RSVP link with your guests.
        </p>

        <form onSubmit={handleSaveCode} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="rsvpCode" className="sr-only">RSVP Code</label>
              <input
                type="text"
                id="rsvpCode"
                value={rsvpCode}
                onChange={(e) => setRsvpCodeValue(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                placeholder="Enter 4-20 alphanumeric code"
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !rsvpCode || rsvpCode.length < 4}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isPending ? "Saving..." : "Save Code"}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">RSVP code saved successfully!</p>
          )}
        </form>

        {/* RSVP Link Preview */}
        {currentRsvpCode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Your RSVP Link:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-800 truncate">
                {rsvpLink}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </button>
              <a
                href={rsvpFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Open RSVP page"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Code: <strong>{currentRsvpCode}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Per-Event Stats */}
      {perEventStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Event Breakdown</h3>
            <p className="text-sm text-gray-500 mt-1">RSVP statistics and meal counts per event</p>
          </div>
          <div className="divide-y divide-gray-200">
            {perEventStats.map((eventStat) => {
              const isExpanded = expandedEvent === eventStat.eventId;
              const mealEntries = Object.entries(eventStat.mealCounts);

              return (
                <div key={eventStat.eventId}>
                  {/* Event Header */}
                  <button
                    onClick={() => toggleEvent(eventStat.eventId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{eventStat.eventName}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(eventStat.eventDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {eventStat.attending} / {eventStat.invited} attending
                        </p>
                        <p className="text-xs text-gray-500">
                          {eventStat.headcount} total headcount
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-gray-50">
                      {/* Response Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{eventStat.invited}</p>
                          <p className="text-xs text-gray-500">Invited</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{eventStat.attending}</p>
                          <p className="text-xs text-gray-500">Attending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{eventStat.declined}</p>
                          <p className="text-xs text-gray-500">Declined</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600">{eventStat.pending}</p>
                          <p className="text-xs text-gray-500">Pending</p>
                        </div>
                      </div>

                      {/* Meal Tallies */}
                      {mealEntries.length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Utensils className="h-4 w-4 text-gray-500" />
                            <h5 className="text-sm font-medium text-gray-700">Meal Choices</h5>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {mealEntries.map(([mealId, count]) => (
                              <div
                                key={mealId}
                                className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                              >
                                <span className="text-sm text-gray-700 truncate">{mealId}</span>
                                <span className="text-sm font-semibold text-gray-900 ml-2">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {mealEntries.length === 0 && eventStat.attending > 0 && (
                        <p className="pt-4 text-sm text-gray-500 italic">
                          No meal options configured for this event
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
