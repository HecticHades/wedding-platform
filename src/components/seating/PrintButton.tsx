"use client";

import { Printer } from "lucide-react";

/**
 * PrintButton - Client component for triggering browser print dialog
 *
 * Separated from the server component print page to allow
 * window.print() functionality in a server-rendered page.
 */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
