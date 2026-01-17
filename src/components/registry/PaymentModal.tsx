"use client";

import { useState, useTransition } from "react";
import { X, Check, Loader2 } from "lucide-react";
import type { GiftItem } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { PaymentQRCode } from "./PaymentQRCode";
import { claimGift } from "@/app/[domain]/registry/actions";

interface PaymentModalProps {
  gift: GiftItem;
  paymentSettings: PrismaJson.PaymentSettings;
  isOpen: boolean;
  onClose: () => void;
  onClaimed: (giftId: string) => void;
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
 * Modal displaying payment QR code and confirmation for gift claiming
 */
export function PaymentModal({
  gift,
  paymentSettings,
  isOpen,
  onClose,
  onClaimed,
}: PaymentModalProps) {
  const [guestName, setGuestName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"payment" | "confirm">("payment");

  if (!isOpen) return null;

  const handleConfirmPayment = () => {
    setStep("confirm");
  };

  const handleClaim = () => {
    setError(null);
    startTransition(async () => {
      const result = await claimGift(gift.id, guestName.trim() || undefined);
      if (result.success) {
        onClaimed(gift.id);
      } else {
        setError(result.error || "Failed to reserve gift");
      }
    });
  };

  const handleClose = () => {
    setStep("payment");
    setGuestName("");
    setError(null);
    onClose();
  };

  const amount = Number(gift.targetAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{gift.name}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "payment" ? (
            <>
              {/* Gift details */}
              <div className="text-center mb-6">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(amount)}
                </p>
                {gift.description && (
                  <p className="mt-2 text-sm text-gray-600">{gift.description}</p>
                )}
              </div>

              {/* QR Code */}
              <div className="mb-6">
                <PaymentQRCode
                  paymentSettings={paymentSettings}
                  amount={amount}
                  giftName={gift.name}
                />
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                I&apos;ve Made the Payment
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* Confirmation step */}
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Thank you for your gift!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Please enter your name so the couple knows who to thank.
                </p>
              </div>

              {/* Name input */}
              <div className="mb-4">
                <label
                  htmlFor="guestName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name (optional)
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g., John & Jane Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
              )}

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleClaim}
                disabled={isPending}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm & Reserve Gift"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("payment")}
                disabled={isPending}
                className="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
