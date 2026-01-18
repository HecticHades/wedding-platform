import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Represents a parsed guest from an import file.
 */
export interface ParsedGuest {
  name: string;
  email?: string;
  partyName?: string;
  address?: string;
}

/**
 * Validation error for a single row.
 */
export interface ImportError {
  row: number;
  message: string;
}

/**
 * Result of parsing an import file.
 */
export interface ParseResult {
  guests: ParsedGuest[];
  errors: ImportError[];
}

/**
 * Column name mappings (case-insensitive).
 * Maps various column header names to our standard field names.
 */
const COLUMN_MAPPINGS: Record<string, keyof ParsedGuest> = {
  // Name mappings
  name: "name",
  "guest name": "name",
  "first name": "name",
  "full name": "name",
  guest: "name",
  // Party/Family name mappings
  "family name": "partyName",
  family: "partyName",
  household: "partyName",
  "party name": "partyName",
  party: "partyName",
  "last name": "partyName",
  surname: "partyName",
  // Email mappings
  email: "email",
  "email address": "email",
  "e-mail": "email",
  // Address mappings
  address: "address",
  "mailing address": "address",
  "street address": "address",
  "home address": "address",
};

/**
 * Normalize a column header to our standard field name.
 */
function normalizeColumnName(header: string): keyof ParsedGuest | null {
  const normalized = header.toLowerCase().trim();
  return COLUMN_MAPPINGS[normalized] || null;
}

/**
 * Simple email validation.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Parse a CSV file and return guests.
 */
export function parseCSV(content: string): ParseResult {
  const guests: ParsedGuest[] = [];
  const errors: ImportError[] = [];

  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      errors.push({
        row: error.row !== undefined ? error.row + 2 : 0, // +2 for 1-based + header
        message: error.message,
      });
    });
  }

  // Map column headers to our fields
  const headers = result.meta.fields || [];
  const columnMap = new Map<string, keyof ParsedGuest>();

  headers.forEach((header) => {
    const field = normalizeColumnName(header);
    if (field) {
      columnMap.set(header, field);
    }
  });

  // Verify we have at least a name column
  const hasNameColumn = Array.from(columnMap.values()).includes("name");
  if (!hasNameColumn) {
    errors.push({
      row: 1,
      message:
        'No "Name" column found. Please include a column with guest names.',
    });
    return { guests, errors };
  }

  // Process each row
  result.data.forEach((row: unknown, index: number) => {
    const rowNum = index + 2; // 1-based + header row
    const record = row as Record<string, string>;

    const guest: ParsedGuest = {
      name: "",
    };

    // Map values from each column
    columnMap.forEach((field, header) => {
      const value = record[header]?.trim();
      if (value) {
        if (field === "email") {
          if (isValidEmail(value)) {
            guest.email = value;
          } else {
            errors.push({
              row: rowNum,
              message: `Invalid email address: "${value}"`,
            });
          }
        } else {
          guest[field] = value;
        }
      }
    });

    // Validate required fields
    if (!guest.name) {
      errors.push({
        row: rowNum,
        message: "Missing guest name",
      });
      return;
    }

    guests.push(guest);
  });

  return { guests, errors };
}

/**
 * Parse an Excel file (xlsx/xls) and return guests.
 */
export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const guests: ParsedGuest[] = [];
  const errors: ImportError[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      errors.push({
        row: 0,
        message: "No sheets found in Excel file",
      });
      return { guests, errors };
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: "",
    });

    if (rows.length === 0) {
      errors.push({
        row: 0,
        message: "No data found in Excel file",
      });
      return { guests, errors };
    }

    // Get headers from first row keys
    const headers = Object.keys(rows[0]);
    const columnMap = new Map<string, keyof ParsedGuest>();

    headers.forEach((header) => {
      const field = normalizeColumnName(header);
      if (field) {
        columnMap.set(header, field);
      }
    });

    // Verify we have at least a name column
    const hasNameColumn = Array.from(columnMap.values()).includes("name");
    if (!hasNameColumn) {
      errors.push({
        row: 1,
        message:
          'No "Name" column found. Please include a column with guest names.',
      });
      return { guests, errors };
    }

    // Process each row
    rows.forEach((row, index) => {
      const rowNum = index + 2; // 1-based + header row

      const guest: ParsedGuest = {
        name: "",
      };

      // Map values from each column
      columnMap.forEach((field, header) => {
        const value = String(row[header] || "").trim();
        if (value) {
          if (field === "email") {
            if (isValidEmail(value)) {
              guest.email = value;
            } else {
              errors.push({
                row: rowNum,
                message: `Invalid email address: "${value}"`,
              });
            }
          } else {
            guest[field] = value;
          }
        }
      });

      // Validate required fields
      if (!guest.name) {
        errors.push({
          row: rowNum,
          message: "Missing guest name",
        });
        return;
      }

      guests.push(guest);
    });
  } catch (err) {
    errors.push({
      row: 0,
      message: `Failed to parse Excel file: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  return { guests, errors };
}

/**
 * Detect file type from filename and parse accordingly.
 */
export async function parseGuestFile(
  file: File
): Promise<ParseResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const content = await file.text();
    return parseCSV(content);
  } else if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer);
  } else {
    return {
      guests: [],
      errors: [
        {
          row: 0,
          message: `Unsupported file type: ${extension}. Please use .csv, .xlsx, or .xls files.`,
        },
      ],
    };
  }
}
