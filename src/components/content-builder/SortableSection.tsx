"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Calendar,
  Heart,
  MapPin,
  Image,
  Clock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SECTION_TYPES, type SectionTypeId } from "@/lib/content/section-types";

interface SortableSectionProps {
  id: string;
  type: SectionTypeId;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

// Map section type icons to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  heart: Heart,
  "map-pin": MapPin,
  image: Image,
  clock: Clock,
  mail: Mail,
};

export function SortableSection({
  id,
  type,
  isVisible,
  onToggleVisibility,
  onDelete,
}: SortableSectionProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get section metadata
  const sectionMeta = SECTION_TYPES.find((s) => s.id === type);
  const IconComponent = sectionMeta ? iconMap[sectionMeta.icon] : null;

  const handleToggleVisibility = () => {
    startTransition(() => {
      onToggleVisibility(id);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      onDelete(id);
      setShowDeleteConfirm(false);
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow border border-gray-200 p-4 ${
        isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Section icon and info */}
        <div className="flex-1 flex items-center gap-3">
          {IconComponent && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">
              {sectionMeta?.label ?? type}
            </h3>
            <p className="text-sm text-gray-500">
              {isVisible ? "Visible to guests" : "Hidden from guests"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Visibility toggle */}
          <button
            onClick={handleToggleVisibility}
            disabled={isPending}
            className={`p-2 rounded-lg transition-colors ${
              isVisible
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            } disabled:opacity-50`}
            aria-label={isVisible ? "Hide section" : "Show section"}
          >
            {isVisible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>

          {/* Edit link */}
          <Link
            href={`/dashboard/content/${type}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit section"
          >
            <Pencil className="h-5 w-5" />
          </Link>

          {/* Delete button with confirmation */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete section"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
