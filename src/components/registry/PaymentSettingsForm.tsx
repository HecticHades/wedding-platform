"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CreditCard, Building2, Smartphone } from "lucide-react";

type PaymentMethod = "bank_transfer" | "paypal" | "twint" | null;

interface PaymentSettings {
  enabled: boolean;
  method: PaymentMethod;
  bankTransfer?: {
    accountName: string;
    iban: string;
    bic?: string;
    currency: "EUR" | "CHF";
  };
  paypal?: {
    username: string;
    currency?: string;
  };
  twint?: {
    displayText: string;
    phoneNumber?: string;
  };
}

interface PaymentSettingsFormProps {
  settings: PaymentSettings | null;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Saving..." : "Save Settings"}
    </button>
  );
}

/**
 * Form for configuring payment settings (bank transfer, PayPal, Twint)
 */
export function PaymentSettingsForm({
  settings,
  action,
}: PaymentSettingsFormProps) {
  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [method, setMethod] = useState<PaymentMethod>(settings?.method ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await action(formData);
    if (!result.success) {
      setError(result.error || "Failed to save settings");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Enable Cash Gifts</h3>
          <p className="text-sm text-gray-500 mt-1">
            Allow guests to contribute cash gifts through your payment method
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Payment method selection */}
      {enabled && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Payment Method</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Bank Transfer option */}
            <label
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                method === "bank_transfer"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="method"
                value="bank_transfer"
                checked={method === "bank_transfer"}
                onChange={() => setMethod("bank_transfer")}
                className="sr-only"
              />
              <Building2
                className={`h-8 w-8 ${
                  method === "bank_transfer" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`mt-2 font-medium ${
                  method === "bank_transfer" ? "text-blue-900" : "text-gray-700"
                }`}
              >
                Bank Transfer
              </span>
              <span className="text-xs text-gray-500 mt-1">SEPA / IBAN</span>
            </label>

            {/* PayPal option */}
            <label
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                method === "paypal"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="method"
                value="paypal"
                checked={method === "paypal"}
                onChange={() => setMethod("paypal")}
                className="sr-only"
              />
              <CreditCard
                className={`h-8 w-8 ${
                  method === "paypal" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`mt-2 font-medium ${
                  method === "paypal" ? "text-blue-900" : "text-gray-700"
                }`}
              >
                PayPal
              </span>
              <span className="text-xs text-gray-500 mt-1">PayPal.me link</span>
            </label>

            {/* Twint option */}
            <label
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                method === "twint"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="method"
                value="twint"
                checked={method === "twint"}
                onChange={() => setMethod("twint")}
                className="sr-only"
              />
              <Smartphone
                className={`h-8 w-8 ${
                  method === "twint" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`mt-2 font-medium ${
                  method === "twint" ? "text-blue-900" : "text-gray-700"
                }`}
              >
                Twint
              </span>
              <span className="text-xs text-gray-500 mt-1">Swiss mobile</span>
            </label>
          </div>
        </div>
      )}

      {/* Bank Transfer fields */}
      {enabled && method === "bank_transfer" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Bank Transfer Details</h4>

          <div>
            <label
              htmlFor="bankAccountName"
              className="block text-sm font-medium text-gray-700"
            >
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={settings?.bankTransfer?.accountName || ""}
              required={method === "bank_transfer"}
              maxLength={70}
              placeholder="John Doe"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bankIban"
              className="block text-sm font-medium text-gray-700"
            >
              IBAN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankIban"
              name="bankIban"
              defaultValue={settings?.bankTransfer?.iban || ""}
              required={method === "bank_transfer"}
              placeholder="DE89 3704 0044 0532 0130 00"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              International Bank Account Number (spaces will be removed)
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="bankBic"
                className="block text-sm font-medium text-gray-700"
              >
                BIC/SWIFT <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="bankBic"
                name="bankBic"
                defaultValue={settings?.bankTransfer?.bic || ""}
                maxLength={11}
                placeholder="COBADEFFXXX"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="bankCurrency"
                className="block text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <select
                id="bankCurrency"
                name="bankCurrency"
                defaultValue={settings?.bankTransfer?.currency || "EUR"}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="EUR">EUR - Euro</option>
                <option value="CHF">CHF - Swiss Franc</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> For EUR transfers, guests will see a QR
              code they can scan with their banking app. For CHF transfers,
              account details will be displayed as text.
            </p>
          </div>
        </div>
      )}

      {/* PayPal fields */}
      {enabled && method === "paypal" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">PayPal Details</h4>

          <div>
            <label
              htmlFor="paypalUsername"
              className="block text-sm font-medium text-gray-700"
            >
              PayPal.me Username <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 text-sm">
                paypal.me/
              </span>
              <input
                type="text"
                id="paypalUsername"
                name="paypalUsername"
                defaultValue={settings?.paypal?.username || ""}
                required={method === "paypal"}
                maxLength={50}
                placeholder="yourname"
                className="block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your PayPal.me username (found in your PayPal settings)
            </p>
          </div>

          <div>
            <label
              htmlFor="paypalCurrency"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred Currency <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="paypalCurrency"
              name="paypalCurrency"
              defaultValue={settings?.paypal?.currency || ""}
              maxLength={3}
              placeholder="EUR"
              className="mt-1 block w-full max-w-[100px] rounded-md border border-gray-300 px-3 py-2 font-mono uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              3-letter currency code (e.g., EUR, USD, CHF)
            </p>
          </div>
        </div>
      )}

      {/* Twint fields */}
      {enabled && method === "twint" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Twint Details</h4>

          <div>
            <label
              htmlFor="twintDisplayText"
              className="block text-sm font-medium text-gray-700"
            >
              Display Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="twintDisplayText"
              name="twintDisplayText"
              defaultValue={settings?.twint?.displayText || ""}
              required={method === "twint"}
              maxLength={200}
              rows={3}
              placeholder="Send your gift via Twint to +41 79 123 4567. Thank you!"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Instructions displayed to guests (max 200 characters)
            </p>
          </div>

          <div>
            <label
              htmlFor="twintPhoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              id="twintPhoneNumber"
              name="twintPhoneNumber"
              defaultValue={settings?.twint?.phoneNumber || ""}
              maxLength={20}
              placeholder="+41 79 123 4567"
              className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Swiss mobile number linked to your Twint account
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Twint payments cannot be automated. Guests
              will see your instructions and make the transfer manually through
              their Twint app.
            </p>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          Security Information
        </h4>
        <p className="text-sm text-gray-600">
          Your payment details are stored securely and are only shown to guests
          who choose to make a cash contribution. IBAN and account details are
          displayed in a secure context and are not indexed by search engines.
        </p>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4 border-t">
        <SubmitButton />
      </div>
    </form>
  );
}
