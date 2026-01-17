"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// IBAN validation regex (basic format check)
// IBAN: 2 letter country code + 2 check digits + up to 30 alphanumeric chars
const ibanSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, "").toUpperCase())
  .pipe(
    z
      .string()
      .min(15, "IBAN too short")
      .max(34, "IBAN too long")
      .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, "Invalid IBAN format")
  );

// BIC/SWIFT validation (8 or 11 chars)
const bicSchema = z
  .string()
  .max(11)
  .optional()
  .or(z.literal(""))
  .transform((val) => (val === "" ? undefined : val?.toUpperCase()));

const paymentSettingsSchema = z.object({
  enabled: z
    .string()
    .optional()
    .transform((val) => val === "on" || val === "true"),
  method: z
    .enum(["bank_transfer", "paypal", "twint", ""])
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  // Bank transfer fields
  bankAccountName: z
    .string()
    .max(70)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  bankIban: ibanSchema.optional().or(z.literal("")),
  bankBic: bicSchema,
  bankCurrency: z.enum(["EUR", "CHF"]).optional(),

  // PayPal fields
  paypalUsername: z
    .string()
    .max(50)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  paypalCurrency: z
    .string()
    .length(3)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  // Twint fields
  twintDisplayText: z
    .string()
    .max(200)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  twintPhoneNumber: z
    .string()
    .max(20)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Update payment settings for the wedding
 */
export async function updatePaymentSettings(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse form data
  const rawData = {
    enabled: formData.get("enabled") as string | null,
    method: formData.get("method") as string | null,
    bankAccountName: formData.get("bankAccountName") as string | null,
    bankIban: formData.get("bankIban") as string | null,
    bankBic: formData.get("bankBic") as string | null,
    bankCurrency: formData.get("bankCurrency") as string | null,
    paypalUsername: formData.get("paypalUsername") as string | null,
    paypalCurrency: formData.get("paypalCurrency") as string | null,
    twintDisplayText: formData.get("twintDisplayText") as string | null,
    twintPhoneNumber: formData.get("twintPhoneNumber") as string | null,
  };

  // Validate input
  const parsed = paymentSettingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  const data = parsed.data;

  // Build PaymentSettings object
  const paymentSettings: PrismaJson.PaymentSettings = {
    enabled: data.enabled,
    method: data.method as "bank_transfer" | "paypal" | "twint" | null,
  };

  // Add method-specific fields
  if (data.method === "bank_transfer" && data.bankAccountName && data.bankIban) {
    paymentSettings.bankTransfer = {
      accountName: data.bankAccountName,
      iban: data.bankIban,
      bic: data.bankBic,
      currency: data.bankCurrency || "EUR",
    };
  }

  if (data.method === "paypal" && data.paypalUsername) {
    paymentSettings.paypal = {
      username: data.paypalUsername,
      currency: data.paypalCurrency,
    };
  }

  if (data.method === "twint" && data.twintDisplayText) {
    paymentSettings.twint = {
      displayText: data.twintDisplayText,
      phoneNumber: data.twintPhoneNumber,
    };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get wedding and update payment settings
      const wedding = await prisma.wedding.findFirst({
        select: { id: true },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      await prisma.wedding.update({
        where: { id: wedding.id },
        data: {
          paymentSettings: paymentSettings,
        },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/registry/settings");
    revalidatePath("/dashboard/registry");
    return result;
  } catch (error) {
    console.error("Failed to update payment settings:", error);
    return { success: false, error: "Failed to update payment settings" };
  }
}
