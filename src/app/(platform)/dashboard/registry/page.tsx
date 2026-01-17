import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import {
  Plus,
  Gift,
  Check,
  DollarSign,
  ExternalLink,
  CreditCard,
  Settings,
  AlertCircle,
} from "lucide-react";
import { GiftList } from "@/components/registry/GiftList";
import { RegistryTabs } from "@/components/registry/RegistryTabs";

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

/**
 * Get payment method display name
 */
function getPaymentMethodName(method: string | null): string {
  switch (method) {
    case "bank_transfer":
      return "Bank Transfer";
    case "paypal":
      return "PayPal";
    case "twint":
      return "Twint";
    default:
      return "Not configured";
  }
}

export default async function RegistryPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch gifts, external registries, and payment settings
  const [gifts, externalRegistries, wedding] = await withTenantContext(
    session.user.tenantId,
    async () => {
      return Promise.all([
        prisma.giftItem.findMany({
          orderBy: { order: "asc" },
        }),
        prisma.externalRegistry.findMany({
          orderBy: { order: "asc" },
        }),
        prisma.wedding.findFirst({
          select: { paymentSettings: true },
        }),
      ]);
    }
  );

  const paymentSettings = wedding?.paymentSettings as PrismaJson.PaymentSettings | null;

  // Calculate stats
  const totalItems = gifts.length;
  const claimedCount = gifts.filter((g) => g.isClaimed).length;
  const totalValue = gifts.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const externalRegistryCount = externalRegistries.length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
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

      {/* Navigation tabs */}
      <RegistryTabs activeTab="gifts" />

      {/* Status indicators */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Payment status */}
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-gray-500" />
          {paymentSettings?.enabled && paymentSettings?.method ? (
            <span className="text-green-700">
              Payments enabled via {getPaymentMethodName(paymentSettings.method)}
            </span>
          ) : (
            <Link
              href="/dashboard/registry/settings"
              className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              Set up payment method
            </Link>
          )}
        </div>

        {/* External registries count */}
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4 text-gray-500" />
          <Link
            href="/dashboard/registry/external"
            className="text-gray-700 hover:text-gray-900"
          >
            {externalRegistryCount} external{" "}
            {externalRegistryCount === 1 ? "registry" : "registries"}
          </Link>
        </div>
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
