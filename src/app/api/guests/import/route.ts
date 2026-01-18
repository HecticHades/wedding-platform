import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { parseCSV, parseExcel, type ParsedGuest, type ImportError } from "@/lib/guests/import-utils";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_EXTENSIONS = ["csv", "xlsx", "xls"];

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate tenant context
    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant context" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Parse the file based on type
    let guests: ParsedGuest[] = [];
    let errors: ImportError[] = [];

    if (extension === "csv") {
      const content = await file.text();
      const result = parseCSV(content);
      guests = result.guests;
      errors = result.errors;
    } else {
      const buffer = await file.arrayBuffer();
      const result = parseExcel(buffer);
      guests = result.guests;
      errors = result.errors;
    }

    // If no guests parsed and there are errors, return errors
    if (guests.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: "Failed to parse file",
          errors,
          imported: 0,
        },
        { status: 400 }
      );
    }

    // Get wedding for this tenant
    const wedding = await withTenantContext(tenantId, async () => {
      return prisma.wedding.findFirst();
    });

    if (!wedding) {
      return NextResponse.json(
        { error: "No wedding found for this account" },
        { status: 404 }
      );
    }

    // Bulk create guests
    const created = await withTenantContext(tenantId, async () => {
      const result = await prisma.guest.createMany({
        data: guests.map((guest) => ({
          weddingId: wedding.id,
          name: guest.name,
          email: guest.email || null,
          partyName: guest.partyName || null,
          address: guest.address || null,
        })),
        skipDuplicates: true, // Skip if there's a conflict
      });
      return result;
    });

    return NextResponse.json({
      success: true,
      imported: created.count,
      total: guests.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Guest import error:", error);
    return NextResponse.json(
      { error: "Import failed. Please try again." },
      { status: 500 }
    );
  }
}
