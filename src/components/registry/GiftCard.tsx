"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(gift.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const closeModal = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Handle escape key and focus trap for modal
  useEffect(() => {
    if (!showDeleteConfirm) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the Cancel button (safer action) when modal opens
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      // Focus trap
      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [showDeleteConfirm, closeModal]);

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
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Claimed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Gift className="h-3 w-3" aria-hidden="true" />
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
              aria-label={`Edit ${gift.name}`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              aria-label={`Delete ${gift.name}`}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h4 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
              Delete Gift?
            </h4>
            <p id="delete-modal-description" className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete &quot;{gift.name}&quot;? This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
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
