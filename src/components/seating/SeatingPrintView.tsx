/**
 * SeatingPrintView - Print-optimized seating chart layout
 *
 * Displays tables in a grid format suitable for printing.
 * Uses print-specific CSS classes to hide interactive elements
 * and ensure clean page breaks.
 */

interface GuestForPrint {
  id: string;
  name: string;
  partyName: string | null;
  plusOneCount: number;
}

interface TableForPrint {
  id: string;
  name: string;
  capacity: number;
  guests: GuestForPrint[];
}

interface SeatingPrintViewProps {
  tables: TableForPrint[];
  weddingName: string;
}

export function SeatingPrintView({ tables, weddingName }: SeatingPrintViewProps) {
  // Calculate total headcount across all tables
  const totalHeadcount = tables.reduce((sum, table) => {
    return sum + table.guests.reduce((guestSum, guest) => guestSum + 1 + guest.plusOneCount, 0);
  }, 0);

  return (
    <div className="print:bg-white print:text-black">
      {/* Header - shows on print */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-2xl font-bold print:text-3xl">{weddingName}</h1>
        <p className="text-gray-600 mt-1 print:text-gray-800">Seating Chart</p>
        <p className="text-sm text-gray-500 mt-2">
          {tables.length} tables | {totalHeadcount} guests
        </p>
      </div>

      {/* Tables grid - 2-3 columns for print */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {tables.map((table) => {
          const occupancy = table.guests.reduce(
            (sum, guest) => sum + 1 + guest.plusOneCount,
            0
          );

          return (
            <div
              key={table.id}
              className="border rounded-lg p-4 bg-white break-inside-avoid print:border-gray-400"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              {/* Table header */}
              <div className="border-b pb-2 mb-3 print:border-gray-300">
                <h2 className="font-semibold text-lg">{table.name}</h2>
                <p className="text-sm text-gray-500 print:text-gray-600">
                  {occupancy} / {table.capacity} seats
                </p>
              </div>

              {/* Guest list */}
              {table.guests.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No guests assigned</p>
              ) : (
                <ul className="space-y-1">
                  {table.guests.map((guest) => (
                    <li key={guest.id} className="text-sm">
                      <span className="font-medium">{guest.name}</span>
                      {guest.plusOneCount > 0 && (
                        <span className="text-gray-500 ml-1">
                          (+{guest.plusOneCount})
                        </span>
                      )}
                      {guest.partyName && (
                        <span className="text-gray-400 block text-xs ml-2">
                          {guest.partyName}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Print-only footer with date */}
      <div className="hidden print:block mt-8 text-center text-sm text-gray-500 border-t pt-4">
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
