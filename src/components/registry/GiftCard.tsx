"use client";

import { useState } from "react";
import { Gift, Check, Pencil, Trash2 } from "lucide-react";
import type { GiftItem } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

interface GiftCardProps {
  gift: GiftItem;
  onEdit: () => void;
  onDelete: (giftId: string) => Promise<void>;
}

/**
 * Format a Decimal amount as currency
 */
function formatCurrency(amount: Decimal | number): string {
  const numValue = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Individual gift card displaying gift details with edit/delete actions
 */
export function GiftCard({ gift, onEdit, onDelete }: GiftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(gift.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header with name and claimed badge */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{gift.name}</h3>
              {gift.isClaimed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Check className="h-3 w-3" />
                  Claimed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Gift className="h-3 w-3" />
                  Available
                </span>
              )}
            </div>
            {gift.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {gift.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit gift"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete gift"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gift details */}
        <div className="mt-4 space-y-2">
          {/* Target amount */}
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(gift.targetAmount)}
          </div>

          {/* Claimed by info */}
          {gift.isClaimed && gift.claimedBy && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Claimed by:</span> {gift.claimedBy}
              {gift.claimedAt && (
                <span className="text-gray-500">
                  {" "}
                  on{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(gift.claimedAt))}
                </span>
              )}
            </div>
          )}

          {/* Image preview */}
          {gift.imageUrl && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gift.imageUrl}
                alt={gift.name}
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900">Delete Gift?</h4>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete &quot;{gift.name}&quot;? This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
