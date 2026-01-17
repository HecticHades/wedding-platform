"use client"

/**
 * Print-specific styles for seating chart
 * Separated into Client Component because styled-jsx requires "use client"
 */
export function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        .print\\:hidden {
          display: none !important;
        }

        @page {
          margin: 0.5in;
          size: letter portrait;
        }

        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `}</style>
  )
}
