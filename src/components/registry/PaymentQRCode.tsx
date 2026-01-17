"use client";

import { QRCodeSVG } from "qrcode.react";
import { generateQRCodeData } from "@/lib/registry/payment-utils";

interface PaymentQRCodeProps {
  paymentSettings: PrismaJson.PaymentSettings;
  amount: number;
  giftName: string;
}

/**
 * Displays payment QR code or instructions based on payment method
 * - Bank transfer (EUR): EPC QR code scannable by banking apps
 * - Bank transfer (CHF): Text-based transfer instructions
 * - PayPal: QR code and clickable PayPal.me link
 * - Twint: Display text with phone number (no QR support for personal use)
 */
export function PaymentQRCode({
  paymentSettings,
  amount,
  giftName,
}: PaymentQRCodeProps) {
  const reference = `Gift: ${giftName}`;
  const qrData = generateQRCodeData(paymentSettings, amount, reference);

  // Twint: show instructions instead of QR
  if (paymentSettings.method === "twint") {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Pay with Twint</h3>
        <p className="text-gray-600 mb-4">
          {paymentSettings.twint?.displayText || "Open Twint and send payment"}
        </p>
        {paymentSettings.twint?.phoneNumber && (
          <p className="font-mono text-xl">{paymentSettings.twint.phoneNumber}</p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Amount: {amount} CHF | Reference: {reference}
        </p>
      </div>
    );
  }

  // CHF bank transfer: show text instructions (no EPC QR support)
  if (
    paymentSettings.method === "bank_transfer" &&
    paymentSettings.bankTransfer?.currency === "CHF" &&
    qrData
  ) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Bank Transfer (CHF)</h3>
        <div className="text-left bg-white p-4 rounded border border-gray-200 font-mono text-sm whitespace-pre-line">
          {qrData}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Copy the details above to your banking app
        </p>
      </div>
    );
  }

  // No payment method configured
  if (!qrData) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Payment not configured</p>
      </div>
    );
  }

  const isPayPal = paymentSettings.method === "paypal";

  return (
    <div className="text-center">
      <QRCodeSVG
        value={qrData}
        size={256}
        level="M"
        includeMargin
        className="mx-auto"
      />
      <p className="mt-4 text-sm text-gray-600">
        Scan with your {isPayPal ? "phone camera or PayPal app" : "banking app"}
      </p>
      {isPayPal && (
        <a
          href={qrData}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          Or click here to pay with PayPal
        </a>
      )}
    </div>
  );
}
