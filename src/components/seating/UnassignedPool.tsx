"use client";

import { useDroppable } from "@dnd-kit/core";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableGuest } from "./DraggableGuest";

interface GuestForSeating {
  id: string;
  name: string;
  plusOneCount: number | null;
}

interface UnassignedPoolProps {
  guests: GuestForSeating[];
}

export function UnassignedPool({ guests }: UnassignedPoolProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassigned",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        isOver
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-700">
          Unassigned Guests ({guests.length})
        </h3>
      </div>

      {guests.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          All guests have been assigned to tables.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {guests.map((guest) => (
            <DraggableGuest
              key={guest.id}
              guest={guest}
              containerId="unassigned"
            />
          ))}
        </div>
      )}
    </div>
  );
}
