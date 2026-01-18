"use client";

import { useState, useTransition, useMemo } from "react";
import { Check, X, Users, Search, Mail, MailCheck } from "lucide-react";
import { updateEventInvitations } from "@/app/(platform)/dashboard/events/actions";
import { SendInvitationButton } from "@/components/guests/SendInvitationButton";
import { useRouter } from "next/navigation";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  partySize: number;
}

interface InvitationStatus {
  guestId: string;
  sentAt: Date | null;
}

interface EventGuestManagerProps {
  eventId: string;
  eventName: string;
  allGuests: Guest[];
  invitedGuestIds: string[];
  invitationStatus?: InvitationStatus[];
}

/**
 * Client component for managing guest invitations to an event.
 * Provides checkboxes for each guest with bulk select/deselect and save functionality.
 */
export function EventGuestManager({
  eventId,
  eventName,
  allGuests,
  invitedGuestIds,
  invitationStatus = [],
}: EventGuestManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(invitedGuestIds)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Create a map of invitation status by guest ID
  const invitationStatusMap = useMemo(() => {
    const map = new Map<string, Date | null>();
    invitationStatus.forEach((status) => {
      map.set(status.guestId, status.sentAt);
    });
    return map;
  }, [invitationStatus]);

  // Filter guests by search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) {
      return allGuests;
    }
    const query = searchQuery.toLowerCase();
    return allGuests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query)
    );
  }, [allGuests, searchQuery]);

  // Summary stats
  const selectedCount = selected.size;
  const totalGuests = allGuests.length;
  const totalPartySize = allGuests
    .filter((g) => selected.has(g.id))
    .reduce((sum, g) => sum + g.partySize, 0);

  // Calculate email stats for invitations
  const selectedGuestIds = Array.from(selected);
  const selectedGuestsWithEmail = allGuests.filter(
    (g) => selected.has(g.id) && g.email
  );
  const alreadySentCount = selectedGuestsWithEmail.filter(
    (g) => invitationStatusMap.get(g.id)
  ).length;

  const handleToggle = (guestId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
    setHasChanges(true);
    setError(null);
  };

  const handleSelectAll = () => {
    setSelected(new Set(allGuests.map((g) => g.id)));
    setHasChanges(true);
    setError(null);
  };

  const handleSelectNone = () => {
    setSelected(new Set());
    setHasChanges(true);
    setError(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateEventInvitations(eventId, Array.from(selected));
      if (result.success) {
        setHasChanges(false);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  if (allGuests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No guests yet</h3>
        <p className="mt-2 text-gray-600">
          Add guests to your wedding before managing event invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Manage Invitations for {eventName}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {selectedCount} of {totalGuests} guests invited
          {totalPartySize !== selectedCount && (
            <span className="text-gray-400">
              {" "}
              ({totalPartySize} total attendees)
            </span>
          )}
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Select None
          </button>
        </div>

        {/* Search */}
        {allGuests.length > 5 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Guest list */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
        {filteredGuests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No guests match your search.
          </div>
        ) : (
          filteredGuests.map((guest) => {
            const isInvited = selected.has(guest.id);
            return (
              <label
                key={guest.id}
                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isInvited ? "bg-green-50/50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isInvited}
                  onChange={() => handleToggle(guest.id)}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {guest.name}
                    </span>
                    {guest.partySize > 1 && (
                      <span className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        +{guest.partySize - 1}
                      </span>
                    )}
                  </div>
                  {guest.email && (
                    <span className="text-sm text-gray-500 truncate block">
                      {guest.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Invitation sent indicator */}
                  {isInvited && invitationStatusMap.get(guest.id) && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <MailCheck className="h-3 w-3" />
                      Sent
                    </span>
                  )}
                  {isInvited && guest.email && !invitationStatusMap.get(guest.id) && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Mail className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                  {isInvited ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
        {/* Send invitations button */}
        {selectedCount > 0 && !hasChanges && (
          <SendInvitationButton
            eventId={eventId}
            guestIds={selectedGuestIds}
            hasEmailCount={selectedGuestsWithEmail.length}
            alreadySentCount={alreadySentCount}
            onComplete={() => router.refresh()}
          />
        )}
        {hasChanges && <div />}

        {/* Save button */}
        {hasChanges && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Saving..." : "Save Invitations"}
          </button>
        )}
      </div>
    </div>
  );
}
