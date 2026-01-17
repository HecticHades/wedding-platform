"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { resend } from "@/lib/email/resend";
import { BroadcastEmail } from "@/components/emails/BroadcastEmail";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { BroadcastMessage, MessageStatus } from "@prisma/client";

// ============================================
// Types
// ============================================

type ActionResult =
  | { success: true }
  | { success: false; error: string };

type SendResult =
  | { success: true; messageId: string; recipientCount: number }
  | { success: false; error: string };

export interface BroadcastMessageSummary {
  id: string;
  subject: string;
  status: MessageStatus;
  recipientCount: number;
  scheduledFor: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}

// ============================================
// Validation Schemas
// ============================================

const broadcastSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be at most 200 characters"),
  content: z.string().min(1, "Message content is required"),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const scheduleSchema = broadcastSchema.extend({
  scheduledFor: z.string().transform((val, ctx) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date format",
      });
      return z.NEVER;
    }

    // Check if in the past
    if (date <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled time must be in the future",
      });
      return z.NEVER;
    }

    // Check if within 30 days (Resend limit)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (date > thirtyDaysFromNow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled time must be within 30 days",
      });
      return z.NEVER;
    }

    return date;
  }),
});

// ============================================
// Helper Functions
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Server Actions
// ============================================

/**
 * Get all broadcast messages for a wedding, ordered by creation date (newest first)
 */
export async function getBroadcastMessages(
  tenantId: string
): Promise<BroadcastMessageSummary[]> {
  return withTenantContext(tenantId, async () => {
    const messages = await prisma.broadcastMessage.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subject: true,
        status: true,
        recipientCount: true,
        scheduledFor: true,
        sentAt: true,
        createdAt: true,
      },
    });

    return messages;
  });
}

/**
 * Get a single broadcast message with full details
 */
export async function getBroadcastMessage(
  tenantId: string,
  messageId: string
): Promise<BroadcastMessage | null> {
  return withTenantContext(tenantId, async () => {
    const message = await prisma.broadcastMessage.findUnique({
      where: { id: messageId },
    });

    return message;
  });
}

/**
 * Send an immediate broadcast to all guests with email addresses
 * Uses Resend batch API for efficient delivery
 */
export async function sendBroadcast(formData: FormData): Promise<SendResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const tenantId = session.user.tenantId;

  // Parse and validate form data
  const rawData = {
    subject: formData.get("subject") as string,
    content: formData.get("content") as string,
    ctaText: formData.get("ctaText") as string | undefined,
    ctaUrl: formData.get("ctaUrl") as string | undefined,
  };

  const parsed = broadcastSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { subject, content, ctaText, ctaUrl } = parsed.data;

  try {
    const result = await withTenantContext(tenantId, async () => {
      // Get wedding info
      const wedding = await prisma.wedding.findFirst({
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
        },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      // Get all guests with email addresses
      const guests = await prisma.guest.findMany({
        where: {
          email: { not: null },
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (guests.length === 0) {
        return {
          success: false as const,
          error: "No guests with email addresses found",
        };
      }

      const coupleNames = `${wedding.partner1Name} & ${wedding.partner2Name}`;

      // Build email list for batch send
      const emails = guests.map((guest) => ({
        from: "Wedding Platform <noreply@resend.dev>",
        to: guest.email!,
        subject,
        react: BroadcastEmail({
          guestName: guest.name,
          coupleNames,
          subject,
          content,
          ctaText: ctaText || undefined,
          ctaUrl: ctaUrl || undefined,
        }),
      }));

      // Send using batch API (up to 100 per call)
      const BATCH_SIZE = 100;
      const allEmailIds: string[] = [];

      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        const { data, error } = await resend.batch.send(batch);

        if (error) {
          console.error("Resend batch error:", error);
          return {
            success: false as const,
            error: "Failed to send emails",
          };
        }

        // Collect email IDs from batch response
        if (data?.data) {
          for (const item of data.data) {
            if (item.id) {
              allEmailIds.push(item.id);
            }
          }
        }
      }

      // Create broadcast message record
      const message = await prisma.broadcastMessage.create({
        data: {
          weddingId: wedding.id,
          subject,
          content,
          status: "SENT",
          sentAt: new Date(),
          resendEmailIds: allEmailIds,
          recipientCount: guests.length,
        },
      });

      return {
        success: true as const,
        messageId: message.id,
        recipientCount: guests.length,
      };
    });

    revalidatePath("/dashboard/messaging");
    return result;
  } catch (error) {
    console.error("Failed to send broadcast:", error);
    return { success: false, error: "Failed to send broadcast" };
  }
}

/**
 * Schedule a broadcast for future delivery
 * Uses individual Resend sends because batch API doesn't support scheduledAt
 */
export async function scheduleBroadcast(formData: FormData): Promise<SendResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const tenantId = session.user.tenantId;

  // Parse and validate form data
  const rawData = {
    subject: formData.get("subject") as string,
    content: formData.get("content") as string,
    ctaText: formData.get("ctaText") as string | undefined,
    ctaUrl: formData.get("ctaUrl") as string | undefined,
    scheduledFor: formData.get("scheduledFor") as string,
  };

  const parsed = scheduleSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { subject, content, ctaText, ctaUrl, scheduledFor } = parsed.data;

  try {
    const result = await withTenantContext(tenantId, async () => {
      // Get wedding info
      const wedding = await prisma.wedding.findFirst({
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
        },
      });

      if (!wedding) {
        return { success: false as const, error: "Wedding not found" };
      }

      // Get all guests with email addresses
      const guests = await prisma.guest.findMany({
        where: {
          email: { not: null },
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (guests.length === 0) {
        return {
          success: false as const,
          error: "No guests with email addresses found",
        };
      }

      const coupleNames = `${wedding.partner1Name} & ${wedding.partner2Name}`;
      const scheduledAtISO = scheduledFor.toISOString();
      const emailIds: string[] = [];

      // Send individual emails with scheduling (batch API doesn't support scheduledAt)
      for (const guest of guests) {
        const { data, error } = await resend.emails.send({
          from: "Wedding Platform <noreply@resend.dev>",
          to: guest.email!,
          subject,
          react: BroadcastEmail({
            guestName: guest.name,
            coupleNames,
            subject,
            content,
            ctaText: ctaText || undefined,
            ctaUrl: ctaUrl || undefined,
          }),
          scheduledAt: scheduledAtISO,
        });

        if (error) {
          console.error(`Failed to schedule email for ${guest.email}:`, error);
          // Continue with other guests
        } else if (data?.id) {
          emailIds.push(data.id);
        }

        // Rate limit: 2 req/sec, so wait 500ms between sends
        await sleep(500);
      }

      if (emailIds.length === 0) {
        return {
          success: false as const,
          error: "Failed to schedule any emails",
        };
      }

      // Create broadcast message record
      const message = await prisma.broadcastMessage.create({
        data: {
          weddingId: wedding.id,
          subject,
          content,
          status: "PENDING",
          scheduledFor,
          resendEmailIds: emailIds,
          recipientCount: emailIds.length,
        },
      });

      return {
        success: true as const,
        messageId: message.id,
        recipientCount: emailIds.length,
      };
    });

    revalidatePath("/dashboard/messaging");
    return result;
  } catch (error) {
    console.error("Failed to schedule broadcast:", error);
    return { success: false, error: "Failed to schedule broadcast" };
  }
}

/**
 * Cancel a scheduled broadcast message
 * Only works for messages with PENDING status
 */
export async function cancelBroadcast(messageId: string): Promise<ActionResult> {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  const tenantId = session.user.tenantId;

  try {
    const result = await withTenantContext(tenantId, async () => {
      // Get the message
      const message = await prisma.broadcastMessage.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          status: true,
          resendEmailIds: true,
        },
      });

      if (!message) {
        return { success: false as const, error: "Message not found" };
      }

      if (message.status !== "PENDING") {
        return {
          success: false as const,
          error: "Only pending messages can be cancelled",
        };
      }

      // Cancel each scheduled email in Resend
      for (const emailId of message.resendEmailIds) {
        try {
          await resend.emails.cancel(emailId);
        } catch (error) {
          console.error(`Failed to cancel email ${emailId}:`, error);
          // Continue cancelling others
        }
      }

      // Update message status
      await prisma.broadcastMessage.update({
        where: { id: messageId },
        data: { status: "CANCELLED" },
      });

      return { success: true as const };
    });

    revalidatePath("/dashboard/messaging");
    return result;
  } catch (error) {
    console.error("Failed to cancel broadcast:", error);
    return { success: false, error: "Failed to cancel broadcast" };
  }
}
