"use client";

import { useState, useTransition } from "react";
import { sendRsvpReminders } from "../actions";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SendRemindersFormProps {
  guestCount: number;
}

export function SendRemindersForm({ guestCount }: SendRemindersFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleSend() {
    setResult(null);
    startTransition(async () => {
      const response = await sendRsvpReminders();

      if (response.success) {
        setResult({
          type: "success",
          message:
            response.sent === 0
              ? "No reminders needed to be sent."
              : `Successfully sent ${response.sent} reminder email${response.sent === 1 ? "" : "s"}!`,
        });
      } else {
        setResult({
          type: "error",
          message: response.error,
        });
      }
    });
  }

  return (
    <div>
      {/* Result message */}
      {result && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
            result.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-5 w-5" />
            Send {guestCount} Reminder{guestCount === 1 ? "" : "s"}
          </>
        )}
      </button>

      {/* Warning note */}
      <p className="mt-4 text-sm text-gray-500">
        Note: Reminder emails will be sent to all guests with email addresses who have
        at least one pending RSVP. Emails are sent using your configured email service.
      </p>
    </div>
  );
}
