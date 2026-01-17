import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { PaymentSettingsForm } from "@/components/registry/PaymentSettingsForm";
import { updatePaymentSettings } from "./actions";

export default async function PaymentSettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch current payment settings
  const wedding = await withTenantContext(session.user.tenantId, async () => {
    return prisma.wedding.findFirst({
      select: {
        paymentSettings: true,
      },
    });
  });

  const paymentSettings = (wedding?.paymentSettings as PrismaJson.PaymentSettings) || null;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/registry"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Registry
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure how guests can contribute cash gifts to your wedding fund.
        </p>
      </div>

      {/* Payment method info */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h3 className="font-medium mb-2">About Payment Methods</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Bank Transfer (SEPA):</strong> Best for European guests.
                Generates a QR code for easy EUR transfers.
              </li>
              <li>
                <strong>PayPal:</strong> Widely used, works internationally.
                Guests click a link to send money via PayPal.
              </li>
              <li>
                <strong>Twint:</strong> Popular in Switzerland. Shows instructions
                for guests to send via the Twint app.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <PaymentSettingsForm
          settings={paymentSettings}
          action={updatePaymentSettings}
        />
      </div>
    </div>
  );
}
