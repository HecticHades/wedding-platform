"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSection } from "./SortableSection";
import {
  updateSectionOrder,
  toggleSectionVisibility,
  deleteSection,
} from "@/app/(platform)/dashboard/content/actions";
import type { SectionTypeId } from "@/lib/content/section-types";

interface Section {
  id: string;
  type: SectionTypeId;
  order: number;
  isVisible: boolean;
}

interface SortableSectionListProps {
  initialSections: Section[];
}

export function SortableSectionList({ initialSections }: SortableSectionListProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order values
        const orderedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        // Persist to server
        startTransition(async () => {
          const result = await updateSectionOrder(
            orderedItems.map((item) => ({ id: item.id, order: item.order }))
          );
          if (!result.success) {
            setError(result.error ?? "Failed to update order");
            // Revert on error
            setSections(initialSections);
          } else {
            setError(null);
          }
        });

        return orderedItems;
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    // Optimistic update
    setSections((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    );

    startTransition(async () => {
      const result = await toggleSectionVisibility(id);
      if (!result.success) {
        setError(result.error ?? "Failed to toggle visibility");
        // Revert on error
        setSections((items) =>
          items.map((item) =>
            item.id === id ? { ...item, isVisible: !item.isVisible } : item
          )
        );
      } else {
        setError(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    const deletedSection = sections.find((s) => s.id === id);
    setSections((items) => {
      const filtered = items.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({ ...item, order: index }));
    });

    startTransition(async () => {
      const result = await deleteSection(id);
      if (!result.success) {
        setError(result.error ?? "Failed to delete section");
        // Revert on error
        if (deletedSection) {
          setSections(initialSections);
        }
      } else {
        setError(null);
      }
    });
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No sections yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                id={section.id}
                type={section.type}
                isVisible={section.isVisible}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isPending && (
        <p className="text-sm text-gray-500 text-center">Saving...</p>
      )}
    </div>
  );
}
