"use client";

import { useState } from "react";
import { Gift, Check, Heart } from "lucide-react";
import type { GiftItem } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { PaymentModal } from "./PaymentModal";

interface PublicGiftListProps {
  gifts: GiftItem[];
  paymentSettings: PrismaJson.PaymentSettings;
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
 * Public gift list component for guests to browse and select gifts
 */
export function PublicGiftList({ gifts, paymentSettings }: PublicGiftListProps) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [claimedGiftIds, setClaimedGiftIds] = useState<Set<string>>(new Set());

  // Mark gift as claimed after successful payment confirmation
  const handleClaimed = (giftId: string) => {
    setClaimedGiftIds((prev) => new Set(prev).add(giftId));
    setSelectedGift(null);
  };

  // Empty state
  if (gifts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No gifts available
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Check back soon for gift registry items.
        </p>
      </div>
    );
  }

  // Count available vs claimed
  const availableCount = gifts.filter(
    (g) => !g.isClaimed && !claimedGiftIds.has(g.id)
  ).length;
  const claimedCount = gifts.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Gift className="h-4 w-4" />
          {availableCount} available
        </span>
        <span className="flex items-center gap-1">
          <Check className="h-4 w-4 text-green-600" />
          {claimedCount} claimed
        </span>
      </div>

      {/* Gift cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map((gift) => {
          const isClaimed = gift.isClaimed || claimedGiftIds.has(gift.id);

          return (
            <div
              key={gift.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
                isClaimed
                  ? "border-gray-200 opacity-75"
                  : "border-gray-200 hover:shadow-md hover:border-blue-300"
              }`}
            >
              {/* Image */}
              {gift.imageUrl && (
                <div className="aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gift.imageUrl}
                    alt={gift.name}
                    className={`w-full h-full object-cover ${
                      isClaimed ? "grayscale" : ""
                    }`}
                  />
                </div>
              )}

              <div className="p-5">
                {/* Header with name and status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        isClaimed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {gift.name}
                    </h3>
                    {gift.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {gift.description}
                      </p>
                    )}
                  </div>

                  {isClaimed && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check className="h-3 w-3" />
                      Claimed
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="mt-3">
                  <p
                    className={`text-xl font-bold ${
                      isClaimed ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(gift.targetAmount)}
                  </p>
                </div>

                {/* Action button */}
                <div className="mt-4">
                  {isClaimed ? (
                    <p className="text-sm text-gray-500 italic">
                      {gift.claimedBy
                        ? `Reserved by ${gift.claimedBy}`
                        : "Already reserved"}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedGift(gift)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      Select This Gift
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedGift && (
        <PaymentModal
          gift={selectedGift}
          paymentSettings={paymentSettings}
          isOpen={!!selectedGift}
          onClose={() => setSelectedGift(null)}
          onClaimed={handleClaimed}
        />
      )}
    </div>
  );
}
