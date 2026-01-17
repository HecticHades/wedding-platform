"use client";

import { useState, useTransition } from "react";
import { updatePhotoSettings } from "@/app/(platform)/dashboard/photos/actions";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface PhotoSharingToggleProps {
  initialEnabled: boolean;
}

/**
 * Toggle component for enabling/disabling photo sharing
 */
export function PhotoSharingToggle({ initialEnabled }: PhotoSharingToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggle = () => {
    const newValue = !enabled;
    setStatus("idle");
    setErrorMessage("");

    // Optimistic update
    setEnabled(newValue);

    startTransition(async () => {
      const result = await updatePhotoSettings(newValue);

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        // Revert on error
        setEnabled(!newValue);
        setStatus("error");
        setErrorMessage(result.error || "Failed to update settings");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Enable Photo Sharing</p>
          <p className="text-sm text-gray-500">
            Allow guests to upload photos to your wedding gallery
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            enabled ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {isPending && (
              <Loader2 className="h-3 w-3 animate-spin absolute top-1 left-1 text-gray-400" />
            )}
          </span>
        </button>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <Check className="h-4 w-4" />
          Settings saved
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* Status indicator */}
      <div
        className={`text-sm px-3 py-2 rounded-lg ${
          enabled
            ? "bg-green-50 text-green-700"
            : "bg-gray-50 text-gray-600"
        }`}
      >
        {enabled ? (
          <>
            <span className="font-medium">Status:</span> Guests can upload photos
            by scanning your QR code
          </>
        ) : (
          <>
            <span className="font-medium">Status:</span> Photo uploads are
            currently disabled
          </>
        )}
      </div>
    </div>
  );
}
