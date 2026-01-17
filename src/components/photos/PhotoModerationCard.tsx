"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  X,
  Trash2,
  Loader2,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { moderatePhoto, deletePhoto } from "@/app/(platform)/dashboard/photos/actions";
import { photoStatusConfig, getRelativeTime } from "@/lib/photos/photo-utils";
import { PhotoStatus } from "@prisma/client";

interface PhotoModerationCardProps {
  photo: {
    id: string;
    url: string;
    caption: string | null;
    uploadedBy: string | null;
    status: PhotoStatus;
    uploadedAt: Date;
    reviewedAt: Date | null;
  };
  isSelected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
}

/**
 * Individual photo card with moderation controls
 */
export function PhotoModerationCard({
  photo,
  isSelected,
  onSelectionChange,
  currentStatus,
}: PhotoModerationCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusConfig = photoStatusConfig[photo.status];

  const handleModerate = (action: "approve" | "reject") => {
    setError(null);

    startTransition(async () => {
      const result = await moderatePhoto(photo.id, action);

      if (!result.success) {
        setError(result.error || "Failed to moderate photo");
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    setIsDeleting(true);

    startTransition(async () => {
      const result = await deletePhoto(photo.id);

      if (!result.success) {
        setError(result.error || "Failed to delete photo");
        setIsDeleting(false);
      }
      setShowDeleteConfirm(false);
    });
  };

  return (
    <div
      className={`relative bg-white rounded-lg border overflow-hidden transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectionChange(photo.id, e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm cursor-pointer"
          />
        </label>
      </div>

      {/* Status badge */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={photo.url}
          alt={photo.caption || "Guest photo"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Photo info */}
      <div className="p-3">
        {/* Uploader and time */}
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {photo.uploadedBy || "Anonymous"}
          </p>
          <p className="text-xs text-gray-500">
            {getRelativeTime(photo.uploadedAt)}
          </p>
        </div>

        {/* Caption */}
        {photo.caption && (
          <p className="text-sm text-gray-600 truncate mb-2">{photo.caption}</p>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        {/* Action buttons based on status */}
        <div className="flex gap-2">
          {currentStatus === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => handleModerate("approve")}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleModerate("reject")}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </button>
            </>
          )}

          {currentStatus === "APPROVED" && (
            <>
              <button
                type="button"
                onClick={() => handleModerate("reject")}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending || isDeleting}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          {currentStatus === "REJECTED" && (
            <>
              <button
                type="button"
                onClick={() => handleModerate("approve")}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Restore
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending || isDeleting}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 z-20">
          <p className="text-sm text-gray-900 text-center mb-4">
            Delete this photo permanently?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
