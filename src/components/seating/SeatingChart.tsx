"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Plus, HelpCircle, X, GripVertical, AlertCircle, Users } from "lucide-react";
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

const INSTRUCTION_DISMISSED_KEY = "seating-instructions-dismissed";

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
  const [showInstructions, setShowInstructions] = useState(true);

  // Form state
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<TableWithGuests | null>(null);

  // Check if instructions were previously dismissed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(INSTRUCTION_DISMISSED_KEY);
      if (dismissed === "true") {
        setShowInstructions(false);
      }
    }
  }, []);

  const dismissInstructions = () => {
    setShowInstructions(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(INSTRUCTION_DISMISSED_KEY, "true");
    }
  };

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
          setError(`Not enough space at ${destTable.name}. Available: ${destTable.capacity - currentOccupancy}, needed: ${guestSeats}`);
          setTimeout(() => setError(null), 5000);
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
        setTimeout(() => setError(null), 5000);
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

  // Check if there's any content
  const isEmpty = tables.length === 0 && unassignedGuests.length === 0;
  const hasContent = tables.length > 0 || unassignedGuests.length > 0;

  return (
    <div className="space-y-6">
      {/* Drag-and-drop instruction banner (dismissible) */}
      {showInstructions && hasContent && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">How to use the seating chart</p>
            <ul className="mt-1 text-sm text-blue-700 space-y-1">
              <li className="flex items-center gap-2">
                <GripVertical className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span>Drag guests between tables or to unassigned</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-100 px-1 rounded flex-shrink-0">Tab</span>
                <span>+ arrow keys for keyboard navigation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-100 px-1 rounded flex-shrink-0">Space</span>
                <span>or <span className="font-mono bg-blue-100 px-1 rounded">Enter</span> to pick up or drop a guest</span>
              </li>
            </ul>
          </div>
          <button
            onClick={dismissInstructions}
            className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Dismiss instructions"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
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
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
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

          {/* Enhanced Empty State */}
          {tables.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No tables yet
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">
                Create tables for your venue to start organizing your seating chart.
              </p>
              <button
                onClick={() => {
                  setShowTableForm(true);
                  setEditingTable(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Your First Table
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              aria-describedby={showInstructions ? "seating-instructions" : undefined}
            >
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
        <p className="text-sm text-gray-500 text-center" aria-live="polite">
          Saving...
        </p>
      )}
    </div>
  );
}
