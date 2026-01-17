import generateSepaQrCode from "sepa-payment-qr-code";

/**
 * Generate QR code data based on payment method configuration
 */
export function generateQRCodeData(
  paymentSettings: PrismaJson.PaymentSettings,
  amount: number,
  reference: string
): string | null {
  if (!paymentSettings.enabled || !paymentSettings.method) {
    return null;
  }

  switch (paymentSettings.method) {
    case "bank_transfer":
      if (!paymentSettings.bankTransfer) return null;
      // EPC QR only works for EUR
      if (paymentSettings.bankTransfer.currency === "EUR") {
        return generateSepaQrCode({
          name: paymentSettings.bankTransfer.accountName,
          iban: paymentSettings.bankTransfer.iban.replace(/\s/g, ""),
          amount: amount,
          unstructuredReference: reference,
        });
      }
      // For CHF, return formatted text (no EPC support)
      return formatSwissBankTransfer(
        paymentSettings.bankTransfer,
        amount,
        reference
      );

    case "paypal":
      if (!paymentSettings.paypal) return null;
      const currency = paymentSettings.paypal.currency || "USD";
      return `https://paypal.me/${paymentSettings.paypal.username}/${amount}${currency}`;

    case "twint":
      // Twint doesn't support QR for personal use
      return null;

    default:
      return null;
  }
}

/**
 * Format Swiss bank transfer details as text (no EPC QR support for CHF)
 */
function formatSwissBankTransfer(
  config: NonNullable<PrismaJson.PaymentSettings["bankTransfer"]>,
  amount: number,
  reference: string
): string {
  return `Bank: ${config.accountName}\nIBAN: ${config.iban}\nAmount: ${amount} CHF\nRef: ${reference}`;
}

/**
 * Get user-friendly label for payment method
 */
export function getPaymentMethodLabel(method: string | null): string {
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
