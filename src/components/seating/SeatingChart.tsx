"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { UnassignedPool } from "./UnassignedPool";
import { TableCard } from "./TableCard";
import { TableForm } from "./TableForm";
import {
  assignGuestToTable,
  createTable,
  updateTable,
} from "@/app/(platform)/dashboard/seating/actions";

interface GuestForSeating {
  id: string;
  name: string;
  plusOneCount: number | null;
}

interface TableWithGuests {
  id: string;
  name: string;
  capacity: number;
  guests: GuestForSeating[];
}

interface SeatingChartProps {
  tables: TableWithGuests[];
  unassignedGuests: GuestForSeating[];
}

export function SeatingChart({
  tables: initialTables,
  unassignedGuests: initialUnassigned,
}: SeatingChartProps) {
  const [tables, setTables] = useState<TableWithGuests[]>(initialTables);
  const [unassignedGuests, setUnassignedGuests] =
    useState<GuestForSeating[]>(initialUnassigned);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);

  // Form state
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<TableWithGuests | null>(null);

  // Sensors with distance constraint to allow button clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (_event: DragStartEvent) => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!over) return;

    const guestId = active.id as string;
    const sourceContainer = active.data.current?.containerId as string;
    const destinationContainer = over.id as string;

    // Skip if dropped in same container
    if (sourceContainer === destinationContainer) return;

    // Get the guest data
    const guest = active.data.current?.guest as GuestForSeating;
    if (!guest) return;

    // Check capacity if moving to a table
    if (destinationContainer !== "unassigned") {
      const destTable = tables.find((t) => t.id === destinationContainer);
      if (destTable) {
        const currentOccupancy = destTable.guests.reduce(
          (sum, g) => sum + 1 + (g.plusOneCount ?? 0),
          0
        );
        const guestSeats = 1 + (guest.plusOneCount ?? 0);
        if (currentOccupancy + guestSeats > destTable.capacity) {
          setError("Table is at capacity");
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
    }

    // Optimistic update
    if (sourceContainer === "unassigned") {
      // Moving from unassigned to a table
      setUnassignedGuests((prev) => prev.filter((g) => g.id !== guestId));
      setTables((prev) =>
        prev.map((table) =>
          table.id === destinationContainer
            ? { ...table, guests: [...table.guests, guest] }
            : table
        )
      );
    } else if (destinationContainer === "unassigned") {
      // Moving from a table to unassigned
      setTables((prev) =>
        prev.map((table) =>
          table.id === sourceContainer
            ? { ...table, guests: table.guests.filter((g) => g.id !== guestId) }
            : table
        )
      );
      setUnassignedGuests((prev) => [...prev, guest]);
    } else {
      // Moving between tables
      setTables((prev) =>
        prev.map((table) => {
          if (table.id === sourceContainer) {
            return { ...table, guests: table.guests.filter((g) => g.id !== guestId) };
          }
          if (table.id === destinationContainer) {
            return { ...table, guests: [...table.guests, guest] };
          }
          return table;
        })
      );
    }

    // Server action
    startTransition(async () => {
      const tableId = destinationContainer === "unassigned" ? null : destinationContainer;
      const result = await assignGuestToTable(guestId, tableId);

      if (!result.success) {
        setError(result.error ?? "Failed to assign guest");
        // Revert optimistic update
        setTables(initialTables);
        setUnassignedGuests(initialUnassigned);
        setTimeout(() => setError(null), 3000);
      } else {
        setError(null);
      }
    });
  };

  const handleCreateTable = async (formData: FormData) => {
    const result = await createTable(formData);
    if (result.success) {
      setShowTableForm(false);
    }
    return result;
  };

  const handleUpdateTable = async (formData: FormData) => {
    if (!editingTable) return { success: false, error: "No table selected" };
    const result = await updateTable(editingTable.id, formData);
    if (result.success) {
      setEditingTable(null);
    }
    return result;
  };

  const handleEditTable = (table: TableWithGuests) => {
    setEditingTable(table);
    setShowTableForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Unassigned Pool */}
        <UnassignedPool guests={unassignedGuests} />

        {/* Tables Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
            <button
              onClick={() => {
                setShowTableForm(true);
                setEditingTable(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
          </div>

          {/* Create Table Form Modal */}
          {showTableForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Create New Table
              </h3>
              <TableForm
                onSubmit={handleCreateTable}
                onCancel={() => setShowTableForm(false)}
              />
            </div>
          )}

          {/* Edit Table Form Modal */}
          {editingTable && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Edit Table: {editingTable.name}
              </h3>
              <TableForm
                initialData={editingTable}
                onSubmit={handleUpdateTable}
                onCancel={() => setEditingTable(null)}
              />
            </div>
          )}

          {/* Tables Grid */}
          {tables.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                No tables yet. Create one to start assigning guests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onEdit={handleEditTable}
                  isDraggingGuest={isDragging}
                />
              ))}
            </div>
          )}
        </div>
      </DndContext>

      {isPending && (
        <p className="text-sm text-gray-500 text-center">Saving...</p>
      )}
    </div>
  );
}
