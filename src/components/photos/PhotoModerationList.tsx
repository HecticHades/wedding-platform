"use client";

import { useState, useTransition } from "react";
import { PhotoModerationCard } from "./PhotoModerationCard";
import { bulkModerate } from "@/app/(platform)/dashboard/photos/actions";
import {
  Check,
  X,
  Loader2,
  ImageOff,
  AlertCircle,
} from "lucide-react";
import { PhotoStatus } from "@prisma/client";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  uploadedBy: string | null;
  status: PhotoStatus;
  uploadedAt: Date;
  reviewedAt: Date | null;
}

interface PhotoModerationListProps {
  photos: Photo[];
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
}

/**
 * Grid of photo cards with bulk moderation support
 */
export function PhotoModerationList({
  photos,
  currentStatus,
}: PhotoModerationListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  const handleBulkModerate = (action: "approve" | "reject") => {
    if (selectedIds.size === 0) return;

    setError(null);

    startTransition(async () => {
      const result = await bulkModerate(Array.from(selectedIds), action);

      if (result.success) {
        setSelectedIds(new Set());
      } else {
        setError(result.error || "Failed to moderate photos");
      }
    });
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <ImageOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {currentStatus === "PENDING"
            ? "No photos pending review"
            : currentStatus === "APPROVED"
            ? "No approved photos"
            : "No rejected photos"}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {currentStatus === "PENDING"
            ? "Guest photos will appear here when uploaded."
            : currentStatus === "APPROVED"
            ? "Approved photos will appear in your public gallery."
            : "Rejected photos are hidden from guests."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === photos.length && photos.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : "Select all"}
              </span>
            </label>

            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-500">
                of {photos.length} photos
              </span>
            )}
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              {currentStatus === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkModerate("approve")}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkModerate("reject")}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Reject Selected
                  </button>
                </>
              )}

              {currentStatus === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => handleBulkModerate("reject")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject Selected
                </button>
              )}

              {currentStatus === "REJECTED" && (
                <button
                  type="button"
                  onClick={() => handleBulkModerate("approve")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Restore Selected
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoModerationCard
            key={photo.id}
            photo={photo}
            isSelected={selectedIds.has(photo.id)}
            onSelectionChange={handleSelectionChange}
            currentStatus={currentStatus}
          />
        ))}
      </div>
    </div>
  );
}
