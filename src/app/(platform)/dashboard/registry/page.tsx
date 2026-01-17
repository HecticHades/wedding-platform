import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Gift, Check, DollarSign } from "lucide-react";
import { GiftList } from "@/components/registry/GiftList";

/**
 * Format currency for stats display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function RegistryPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch gifts with tenant context, ordered by order field
  const gifts = await withTenantContext(session.user.tenantId, async () => {
    return prisma.giftItem.findMany({
      orderBy: { order: "asc" },
    });
  });

  // Calculate stats
  const totalItems = gifts.length;
  const claimedCount = gifts.filter((g) => g.isClaimed).length;
  const totalValue = gifts.reduce((sum, g) => sum + Number(g.targetAmount), 0);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Registry</h1>
          <p className="mt-2 text-gray-600">
            Manage your gift registry items for guests to contribute to.
          </p>
        </div>

        <Link
          href="/dashboard/registry/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Gift
        </Link>
      </div>

      {/* Stats summary */}
      {totalItems > 0 && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Claimed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {claimedCount} / {totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift list */}
      <GiftList gifts={gifts} />
    </div>
  );
}
