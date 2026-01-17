"use server";

import { auth } from "@/lib/auth/auth";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Table validation schema
const tableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});

/**
 * Create a new table for the couple's seating chart
 */
export async function createTable(formData: FormData) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get("name"),
    capacity: formData.get("capacity"),
  };

  const parsed = tableSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] ?? "Invalid data";
    return { success: false, error: firstError };
  }

  const data = parsed.data;

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Get the wedding for this tenant
      const wedding = await prisma.wedding.findFirst({
        select: { id: true },
      });

      if (!wedding) {
        return { success: false, error: "Wedding not found" };
      }

      // Find max order to set new table order
      const maxOrderTable = await prisma.table.findFirst({
        where: { weddingId: wedding.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = (maxOrderTable?.order ?? -1) + 1;

      // Create the table
      const table = await prisma.table.create({
        data: {
          weddingId: wedding.id,
          name: data.name,
          capacity: data.capacity,
          order: newOrder,
        },
      });

      return { success: true, tableId: table.id };
    });

    revalidatePath("/dashboard/seating");
    return result;
  } catch (error) {
    console.error("Error creating table:", error);
    return { success: false, error: "Failed to create table" };
  }
}

/**
 * Update an existing table
 */
export async function updateTable(tableId: string, formData: FormData) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!tableId) {
    return { success: false, error: "Table ID is required" };
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get("name"),
    capacity: formData.get("capacity"),
  };

  const parsed = tableSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] ?? "Invalid data";
    return { success: false, error: firstError };
  }

  const data = parsed.data;

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify table belongs to tenant's wedding (tenant isolation via Prisma extension)
      const existingTable = await prisma.table.findFirst({
        where: { id: tableId },
        select: { id: true },
      });

      if (!existingTable) {
        return { success: false, error: "Table not found" };
      }

      // Update the table
      await prisma.table.update({
        where: { id: tableId },
        data: {
          name: data.name,
          capacity: data.capacity,
        },
      });

      return { success: true };
    });

    revalidatePath("/dashboard/seating");
    return result;
  } catch (error) {
    console.error("Error updating table:", error);
    return { success: false, error: "Failed to update table" };
  }
}

/**
 * Delete a table (SeatAssignments cascade via onDelete)
 */
export async function deleteTable(tableId: string) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!tableId) {
    return { success: false, error: "Table ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify table belongs to tenant's wedding (tenant isolation via Prisma extension)
      const existingTable = await prisma.table.findFirst({
        where: { id: tableId },
        select: { id: true },
      });

      if (!existingTable) {
        return { success: false, error: "Table not found" };
      }

      // Delete the table (SeatAssignment records cascade via onDelete)
      await prisma.table.delete({
        where: { id: tableId },
      });

      return { success: true };
    });

    revalidatePath("/dashboard/seating");
    return result;
  } catch (error) {
    console.error("Error deleting table:", error);
    return { success: false, error: "Failed to delete table" };
  }
}

/**
 * Assign a guest to a table, or unassign if tableId is null
 * Validates capacity including plus-ones
 */
export async function assignGuestToTable(
  guestId: string,
  tableId: string | null
) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!guestId) {
    return { success: false, error: "Guest ID is required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify guest belongs to tenant's wedding
      const guest = await prisma.guest.findFirst({
        where: { id: guestId },
        select: {
          id: true,
          seatAssignment: { select: { tableId: true } },
        },
      });

      if (!guest) {
        return { success: false, error: "Guest not found" };
      }

      // If tableId is null, unassign the guest
      if (tableId === null) {
        if (guest.seatAssignment) {
          await prisma.seatAssignment.delete({
            where: { guestId },
          });
        }
        return { success: true };
      }

      // Verify table belongs to tenant's wedding
      const table = await prisma.table.findFirst({
        where: { id: tableId },
        select: {
          id: true,
          capacity: true,
          seatAssignments: {
            select: {
              guestId: true,
              guest: {
                select: {
                  id: true,
                  allowPlusOne: true,
                  eventInvitations: {
                    where: { rsvpStatus: "ATTENDING" },
                    select: { plusOneCount: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!table) {
        return { success: false, error: "Table not found" };
      }

      // Calculate current occupancy (sum of 1 + plusOneCount for each guest)
      // Get guest details for the new guest being assigned
      const newGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        select: {
          allowPlusOne: true,
          eventInvitations: {
            where: { rsvpStatus: "ATTENDING" },
            select: { plusOneCount: true },
          },
        },
      });

      // Calculate seats used by current assignments (excluding the guest if already assigned to this table)
      let currentOccupancy = 0;
      for (const assignment of table.seatAssignments) {
        if (assignment.guestId === guestId) continue; // Skip if guest is already at this table
        const plusOneCount = assignment.guest.eventInvitations[0]?.plusOneCount ?? 0;
        currentOccupancy += 1 + plusOneCount;
      }

      // Calculate seats needed for the new guest
      const newGuestPlusOnes = newGuest?.eventInvitations[0]?.plusOneCount ?? 0;
      const seatsNeeded = 1 + newGuestPlusOnes;

      if (currentOccupancy + seatsNeeded > table.capacity) {
        return { success: false, error: "Table is at capacity" };
      }

      // Use upsert to handle both new assignments and moves between tables
      await prisma.seatAssignment.upsert({
        where: { guestId },
        create: {
          tableId,
          guestId,
        },
        update: {
          tableId,
        },
      });

      return { success: true };
    });

    revalidatePath("/dashboard/seating");
    return result;
  } catch (error) {
    console.error("Error assigning guest to table:", error);
    return { success: false, error: "Failed to assign guest to table" };
  }
}

/**
 * Reorder tables by updating their order field
 */
export async function reorderTables(orderedIds: string[]) {
  const session = await auth();

  if (!session || !session.user.tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!orderedIds || orderedIds.length === 0) {
    return { success: false, error: "Table IDs are required" };
  }

  try {
    const result = await withTenantContext(session.user.tenantId, async () => {
      // Verify all tables belong to tenant's wedding
      const tables = await prisma.table.findMany({
        where: { id: { in: orderedIds } },
        select: { id: true },
      });

      if (tables.length !== orderedIds.length) {
        return { success: false, error: "One or more tables not found" };
      }

      // Update order for each table
      await prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.table.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return { success: true };
    });

    revalidatePath("/dashboard/seating");
    return result;
  } catch (error) {
    console.error("Error reordering tables:", error);
    return { success: false, error: "Failed to reorder tables" };
  }
}
