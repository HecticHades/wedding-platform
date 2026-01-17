"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Gift } from "lucide-react";
import Link from "next/link";
import type { GiftItem } from "@prisma/client";
import { GiftCard } from "./GiftCard";
import { deleteGift } from "@/app/(platform)/dashboard/registry/actions";

interface GiftListProps {
  gifts: GiftItem[];
}

/**
 * Gift list component displaying all gifts with search capability
 */
export function GiftList({ gifts }: GiftListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter gifts by name
  const filteredGifts = gifts.filter((gift) =>
    gift.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (giftId: string) => {
    router.push(`/dashboard/registry/${giftId}`);
  };

  const handleDelete = async (giftId: string) => {
    const result = await deleteGift(giftId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(result.error);
    }
  };

  // Empty state
  if (gifts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No gifts yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Add gifts to your registry for guests to contribute to.
        </p>
        <Link
          href="/dashboard/registry/new"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Gift
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {filteredGifts.length} of {gifts.length} gift
          {gifts.length !== 1 ? "s" : ""}
        </p>

        {/* Search input */}
        {gifts.length > 3 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Gift cards grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
          isPending ? "opacity-50" : ""
        }`}
      >
        {filteredGifts.map((gift) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            onEdit={() => handleEdit(gift.id)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* No results from search */}
      {filteredGifts.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">
            No gifts match &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
