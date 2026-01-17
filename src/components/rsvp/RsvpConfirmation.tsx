"use client";

import Link from "next/link";
import { CheckCircle2, PartyPopper, Home } from "lucide-react";

interface RsvpConfirmationProps {
  guestName: string;
  coupleNames: string;
  eventsCount: number;
  domain: string;
}

export function RsvpConfirmation({
  guestName,
  coupleNames,
  eventsCount,
  domain,
}: RsvpConfirmationProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-wedding-primary/10 p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <PartyPopper className="w-8 h-8 text-wedding-primary" />
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <h2 className="font-wedding-heading text-2xl text-wedding-primary mb-2">
          Thank You, {guestName}!
        </h2>

        <p className="font-wedding text-wedding-text/70 mb-6">
          Your response has been recorded for {coupleNames}&apos;s wedding.
        </p>

        {/* Summary */}
        <div className="bg-wedding-primary/5 rounded-xl p-4 mb-6">
          <p className="font-wedding text-sm text-wedding-text">
            You have responded to{" "}
            <span className="font-semibold text-wedding-primary">
              {eventsCount} event{eventsCount !== 1 ? "s" : ""}
            </span>
          </p>
        </div>

        {/* Back to Homepage Link */}
        <Link
          href={`/${domain}`}
          className="inline-flex items-center gap-2 text-wedding-primary hover:text-wedding-primary/80 font-wedding text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Wedding Site</span>
        </Link>

        {/* Note */}
        <p className="mt-6 font-wedding text-xs text-wedding-text/50">
          You can update your response at any time by returning to this page.
        </p>
      </div>
    </div>
  );
}
