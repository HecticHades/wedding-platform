"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { cancelBroadcast } from "../actions";

interface CancelMessageButtonProps {
  messageId: string;
}

export function CancelMessageButton({ messageId }: CancelMessageButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);

    startTransition(async () => {
      const result = await cancelBroadcast(messageId);

      if (result.success) {
        router.push("/dashboard/messaging");
      } else {
        setError(result.error);
        setShowConfirm(false);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-3">
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
        <span className="text-sm text-gray-600">Cancel this message?</span>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Yes, Cancel
            </>
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
        >
          No, Keep It
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
    >
      <XCircle className="h-4 w-4" />
      Cancel Message
    </button>
  );
}
