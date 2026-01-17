"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GiftItem } from "@prisma/client";
import { createGift, updateGift } from "@/app/(platform)/dashboard/registry/actions";

interface GiftFormProps {
  gift?: GiftItem;
  onSuccess?: () => void;
}

/**
 * Gift form component for creating and editing gifts
 */
export function GiftForm({ gift, onSuccess }: GiftFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!gift;

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      let result;

      if (isEditing) {
        result = await updateGift(gift.id, formData);
      } else {
        result = await createGift(formData);
      }

      if (result.success) {
        onSuccess?.();
        router.push("/dashboard/registry");
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleCancel = () => {
    router.push("/dashboard/registry");
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Gift Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Gift Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={gift?.name || ""}
          required
          maxLength={100}
          placeholder="e.g., KitchenAid Stand Mixer, Honeymoon Fund"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Target Amount */}
      <div>
        <label
          htmlFor="targetAmount"
          className="block text-sm font-medium text-gray-700"
        >
          Target Amount <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            defaultValue={gift ? Number(gift.targetAmount) : ""}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          The suggested contribution amount for this gift.
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={gift?.description || ""}
          placeholder="Add a description or note about this gift..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional. Max 500 characters.
        </p>
      </div>

      {/* Image URL */}
      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          defaultValue={gift?.imageUrl || ""}
          placeholder="https://example.com/image.jpg"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional. Link to an image of the gift.
        </p>
      </div>

      {/* Claimed status display (edit mode only) */}
      {isEditing && gift.isClaimed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800">
                This gift has been claimed
              </h4>
              {gift.claimedBy && (
                <p className="mt-1 text-sm text-green-700">
                  Claimed by: {gift.claimedBy}
                  {gift.claimedAt && (
                    <>
                      {" "}
                      on{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(gift.claimedAt))}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Gift"}
        </button>
      </div>
    </form>
  );
}
