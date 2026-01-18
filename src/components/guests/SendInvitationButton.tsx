"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { sendEventInvitations } from "@/app/(platform)/dashboard/guests/invitation-actions";

interface SendInvitationButtonProps {
  eventId: string;
  guestIds: string[];
  hasEmailCount: number;
  alreadySentCount: number;
  disabled?: boolean;
  onComplete?: () => void;
}

/**
 * Button component for sending invitation emails to selected guests
 */
export function SendInvitationButton({
  eventId,
  guestIds,
  hasEmailCount,
  alreadySentCount,
  disabled,
  onComplete,
}: SendInvitationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    sent?: number;
    skipped?: number;
    error?: string;
  } | null>(null);
  const [showResendOption, setShowResendOption] = useState(false);

  const pendingCount = hasEmailCount - alreadySentCount;
  const canSend = guestIds.length > 0 && hasEmailCount > 0;

  const handleSend = (resendToAll: boolean = false) => {
    setResult(null);
    setShowResendOption(false);

    startTransition(async () => {
      const response = await sendEventInvitations(eventId, guestIds, {
        resendToAll,
      });

      if (response.success) {
        setResult({
          success: true,
          sent: response.sent,
          skipped: response.skipped,
        });
        onComplete?.();
      } else {
        setResult({
          success: false,
          error: response.error,
        });
      }
    });
  };

  // Clear result after a delay
  if (result && !isPending) {
    setTimeout(() => setResult(null), 5000);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (alreadySentCount > 0 && pendingCount === 0) {
              setShowResendOption(true);
            } else {
              handleSend(false);
            }
          }}
          disabled={disabled || isPending || !canSend}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Invitations
            </>
          )}
        </button>

        {/* Stats */}
        {canSend && !isPending && (
          <span className="text-sm text-gray-500">
            {pendingCount > 0 ? (
              <>
                {pendingCount} to send
                {alreadySentCount > 0 && ` (${alreadySentCount} already sent)`}
              </>
            ) : alreadySentCount > 0 ? (
              `All ${alreadySentCount} already sent`
            ) : null}
          </span>
        )}

        {!canSend && guestIds.length > 0 && (
          <span className="text-sm text-gray-500">
            No guests with email addresses
          </span>
        )}
      </div>

      {/* Resend confirmation */}
      {showResendOption && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-72">
          <p className="text-sm text-gray-700 mb-3">
            All selected guests have already been sent invitations. Do you want
            to resend?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSend(true)}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              Resend All
            </button>
            <button
              type="button"
              onClick={() => setShowResendOption(false)}
              className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result message */}
      {result && (
        <div
          className={`absolute top-full left-0 mt-2 p-3 rounded-lg flex items-start gap-2 ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {result.success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800">
                Sent {result.sent} invitation{result.sent !== 1 ? "s" : ""}
                {result.skipped && result.skipped > 0
                  ? ` (${result.skipped} skipped)`
                  : ""}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{result.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
