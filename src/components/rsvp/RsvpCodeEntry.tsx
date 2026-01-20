"use client";

import { useState, useTransition } from "react";
import { validateRsvpCode } from "@/app/[domain]/rsvp/actions";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { ThemedCard } from "@/components/theme/ThemedCard";
import { ThemedButton } from "@/components/theme/ThemedButton";

interface RsvpCodeEntryProps {
  weddingId: string;
  onSuccess: () => void;
}

export function RsvpCodeEntry({ weddingId, onSuccess }: RsvpCodeEntryProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Please enter your RSVP code");
      return;
    }

    startTransition(async () => {
      const result = await validateRsvpCode(weddingId, code.trim());

      if (result.valid) {
        // Refresh the page to pick up the new cookie
        router.refresh();
        onSuccess();
      } else {
        setError(result.error || "Invalid RSVP code");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <ThemedCard variant="glass" className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-wedding-primary/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-wedding-primary" />
          </div>
          <h2 className="font-wedding-heading text-2xl text-wedding-primary mb-2">
            Enter RSVP Code
          </h2>
          <p className="font-wedding text-wedding-text text-sm">
            Please enter the RSVP code from your invitation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="rsvpCode"
              className="block font-wedding text-sm font-medium text-wedding-text mb-2"
            >
              RSVP Code
            </label>
            <input
              type="text"
              id="rsvpCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., SMITH2026"
              className="w-full px-4 py-3 font-wedding text-lg tracking-wider uppercase border border-wedding-primary/20 focus:outline-none focus:ring-2 focus:ring-wedding-primary/30 focus:border-wedding-primary/40 bg-white text-wedding-text placeholder:text-wedding-text/40"
              style={{ borderRadius: "var(--wedding-radius)" }}
              disabled={isPending}
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 px-4 py-3"
              style={{ borderRadius: "var(--wedding-radius)" }}
            >
              <p className="font-wedding text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <ThemedButton
            type="submit"
            disabled={isPending}
            fullWidth
            isLoading={isPending}
          >
            {isPending ? "Verifying..." : "Continue"}
          </ThemedButton>
        </form>

        {/* Help Text */}
        <p className="mt-6 text-center font-wedding text-xs text-wedding-text/50">
          Can&apos;t find your code? Contact the couple for assistance.
        </p>
      </ThemedCard>
    </div>
  );
}
