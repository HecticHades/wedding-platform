import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Gift } from "lucide-react";
import Link from "next/link";
import type { Decimal } from "@prisma/client/runtime/library";
import { GiftDetailClient } from "./GiftDetailClient";

interface PageProps {
  params: Promise<{ domain: string; giftId: string }>;
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

export default async function GiftDetailPage({ params }: PageProps) {
  const { domain, giftId } = await params;

  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
          paymentSettings: true,
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  // Fetch the specific gift
  const gift = await prisma.giftItem.findFirst({
    where: {
      id: giftId,
      weddingId: tenant.wedding.id,
    },
  });

  if (!gift) {
    notFound();
  }

  const paymentSettings =
    (tenant.wedding.paymentSettings as PrismaJson.PaymentSettings) || {
      enabled: false,
      method: null,
    };

  const hasPaymentConfigured =
    paymentSettings.enabled && paymentSettings.method;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/registry`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registry
        </Link>

        {/* Gift card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image */}
          {gift.imageUrl && (
            <div className="aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gift.imageUrl}
                alt={gift.name}
                className={`w-full h-full object-cover ${
                  gift.isClaimed ? "grayscale" : ""
                }`}
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${
                    gift.isClaimed
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {gift.name}
                </h1>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    gift.isClaimed ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {formatCurrency(gift.targetAmount)}
                </p>
              </div>

              {gift.isClaimed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <Check className="h-4 w-4" />
                  Claimed
                </span>
              )}
            </div>

            {/* Description */}
            {gift.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">
                {gift.description}
              </p>
            )}

            {/* Claimed info */}
            {gift.isClaimed && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      This gift has been claimed
                    </p>
                    {gift.claimedBy && (
                      <p className="text-sm text-gray-600">
                        Reserved by {gift.claimedBy}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Available gift: show payment/claim UI */}
            {!gift.isClaimed && (
              <div className="mt-8">
                {hasPaymentConfigured ? (
                  <GiftDetailClient
                    gift={{
                      id: gift.id,
                      name: gift.name,
                      description: gift.description,
                      targetAmount: Number(gift.targetAmount),
                      imageUrl: gift.imageUrl,
                    }}
                    paymentSettings={paymentSettings}
                  />
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Gift className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-gray-600">
                      Payment details coming soon
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Couple names */}
        <p className="mt-8 text-center text-sm text-gray-500">
          {tenant.wedding.partner1Name} & {tenant.wedding.partner2Name}&apos;s
          Gift Registry
        </p>
      </div>
    </div>
  );
}
