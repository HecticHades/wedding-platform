"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableGuestProps {
  guest: {
    id: string;
    name: string;
    plusOneCount: number | null;
  };
  containerId: string;
}

export function DraggableGuest({ guest, containerId }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { containerId, guest },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-full text-sm cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-50 shadow-lg ring-2 ring-blue-500"
      )}
    >
      <User className="h-3 w-3 text-gray-400" />
      <span>{guest.name}</span>
      {(guest.plusOneCount ?? 0) > 0 && (
        <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">+{guest.plusOneCount}</span>
      )}
    </div>
  );
}
