"use client";

import { useState, useTransition } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Pencil, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableGuest } from "./DraggableGuest";
import { deleteTable } from "@/app/(platform)/dashboard/seating/actions";

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

interface TableCardProps {
  table: TableWithGuests;
  onEdit: (table: TableWithGuests) => void;
  isDraggingGuest: boolean;
}

export function TableCard({ table, onEdit, isDraggingGuest }: TableCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
  });

  // Calculate current occupancy including plus-ones
  const currentOccupancy = table.guests.reduce(
    (sum, guest) => sum + 1 + (guest.plusOneCount ?? 0),
    0
  );

  const isFull = currentOccupancy >= table.capacity;

  // Determine visual state when dragging
  const getDragOverStyle = () => {
    if (!isOver) return "";
    if (isFull) return "border-red-500 bg-red-50";
    return "border-blue-500 bg-blue-50";
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTable(table.id);
      if (result.success) {
        setShowDeleteConfirm(false);
      }
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-white rounded-lg shadow border-2 p-4 transition-colors",
        isDraggingGuest && isFull ? "border-gray-200 opacity-50" : "border-gray-200",
        getDragOverStyle()
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{table.name}</h3>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isFull
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {currentOccupancy}/{table.capacity}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button */}
          <button
            onClick={() => onEdit(table)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            aria-label="Edit table"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete button with confirmation */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete table"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Guests */}
      {table.guests.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-gray-400">
          <Users className="h-5 w-5 mr-2" />
          <span className="text-sm">Drop guests here</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {table.guests.map((guest) => (
            <DraggableGuest
              key={guest.id}
              guest={guest}
              containerId={table.id}
            />
          ))}
        </div>
      )}

      {/* Full table warning */}
      {isOver && isFull && (
        <p className="mt-2 text-xs text-red-600 text-center">
          Table is at capacity
        </p>
      )}
    </div>
  );
}
