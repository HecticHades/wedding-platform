import Papa from "papaparse";

/**
 * Data shape for RSVP CSV export
 */
export interface RsvpExportData {
  guestName: string;
  email: string | null;
  phone: string | null;
  partyName: string | null;
  eventName: string;
  rsvpStatus: string;
  plusOneCount: number;
  plusOneName: string | null;
  mealChoice: string | null;
  dietaryNotes: string | null;
  respondedAt: string | null;
}

/**
 * Generate CSV string from RSVP data using papaparse
 */
export function generateRsvpCsv(data: RsvpExportData[]): string {
  // Transform to CSV-friendly format with proper headers
  const csvData = data.map((row) => ({
    "Guest Name": row.guestName,
    "Email": row.email ?? "",
    "Phone": row.phone ?? "",
    "Party": row.partyName ?? "",
    "Event": row.eventName,
    "Status": row.rsvpStatus,
    "Plus Ones": row.plusOneCount,
    "Plus One Name": row.plusOneName ?? "",
    "Meal Choice": row.mealChoice ?? "",
    "Dietary Notes": row.dietaryNotes ?? "",
    "Responded At": row.respondedAt ?? "",
  }));

  return Papa.unparse(csvData);
}
