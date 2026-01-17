"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, Users, UserPlus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteGuest } from "@/app/(platform)/dashboard/guests/actions";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  partyName: string | null;
  partySize: number;
  allowPlusOne: boolean;
}

interface GuestCardProps {
  guest: Guest;
  onDeleted?: () => void;
}

/**
 * Individual guest card component displaying guest info and actions
 */
export function GuestCard({ guest, onDeleted }: GuestCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGuest(guest.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        onDeleted?.();
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        {/* Guest icon */}
        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
          <User className="h-5 w-5 text-blue-600" />
        </div>

        {/* Guest info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{guest.name}</h3>

          {/* Contact info */}
          <div className="mt-1 space-y-1">
            {guest.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{guest.email}</span>
              </div>
            )}
            {guest.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{guest.phone}</span>
              </div>
            )}
          </div>

          {/* Party info */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {guest.partyName && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                <Users className="h-3 w-3" />
                {guest.partyName}
              </span>
            )}
            {guest.partySize > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <Users className="h-3 w-3" />
                {guest.partySize} {guest.partySize === 1 ? "person" : "people"}
              </span>
            )}
            {guest.allowPlusOne && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <UserPlus className="h-3 w-3" />
                +1 Allowed
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit link */}
          <Link
            href={`/dashboard/guests/${guest.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit guest"
          >
            <Pencil className="h-5 w-5" />
          </Link>

          {/* Delete button with confirmation */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete guest"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
