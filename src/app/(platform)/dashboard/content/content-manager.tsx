"use client";

import { useRouter } from "next/navigation";
import { SortableSectionList } from "@/components/content-builder/SortableSectionList";
import { AddSectionDialog } from "@/components/content-builder/AddSectionDialog";
import type { SectionTypeId } from "@/lib/content/section-types";

interface Section {
  id: string;
  type: SectionTypeId;
  order: number;
  isVisible: boolean;
}

interface ContentManagerProps {
  initialSections: Section[];
}

export function ContentManager({ initialSections }: ContentManagerProps) {
  const router = useRouter();

  // Get existing section types
  const existingSectionTypes = initialSections.map((s) => s.type);

  const handleSectionAdded = () => {
    // Refresh the page to get updated sections from server
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {initialSections.length === 0
            ? "Get started by adding your first section"
            : `${initialSections.length} section${initialSections.length !== 1 ? "s" : ""}`}
        </p>
        <AddSectionDialog
          existingSectionTypes={existingSectionTypes}
          onSectionAdded={handleSectionAdded}
        />
      </div>

      {/* Section list */}
      <SortableSectionList initialSections={initialSections} />

      {/* Help text */}
      {initialSections.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900">Tips</h3>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            <li>Drag sections using the grip handle to reorder them</li>
            <li>Click the eye icon to show/hide a section from guests</li>
            <li>Click the pencil icon to edit section content</li>
            <li>Changes are saved automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
}
