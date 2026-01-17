"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Heart } from "lucide-react";
import { PaymentQRCode } from "@/components/registry/PaymentQRCode";
import { claimGift } from "../actions";

interface GiftDetailClientProps {
  gift: {
    id: string;
    name: string;
    description: string | null;
    targetAmount: number;
    imageUrl: string | null;
  };
  paymentSettings: PrismaJson.PaymentSettings;
}

/**
 * Client component for gift detail page with payment and claiming
 */
export function GiftDetailClient({
  gift,
  paymentSettings,
}: GiftDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"payment" | "confirm" | "success">("payment");

  const handleConfirmPayment = () => {
    setStep("confirm");
  };

  const handleClaim = () => {
    setError(null);
    startTransition(async () => {
      const result = await claimGift(gift.id, guestName.trim() || undefined);
      if (result.success) {
        setStep("success");
        // Refresh page after short delay to show claimed status
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || "Failed to reserve gift");
      }
    });
  };

  if (step === "success") {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Thank you for your gift!
        </h3>
        <p className="mt-2 text-gray-600">
          {gift.name} has been reserved. The couple will be so grateful!
        </p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Almost done!
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your name so the couple knows who to thank.
          </p>
        </div>

        {/* Name input */}
        <div>
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
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Buttons */}
        <div className="space-y-3">
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
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <PaymentQRCode
        paymentSettings={paymentSettings}
        amount={gift.targetAmount}
        giftName={gift.name}
      />

      {/* Confirm button */}
      <button
        type="button"
        onClick={handleConfirmPayment}
        className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <Check className="h-5 w-5" />
        I&apos;ve Made the Payment
      </button>
    </div>
  );
}
