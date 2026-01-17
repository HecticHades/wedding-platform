"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Heart,
  MapPin,
  Image,
  Clock,
  Mail,
  Plus,
} from "lucide-react";
import { SECTION_TYPES, type SectionTypeId } from "@/lib/content/section-types";
import { addSection } from "@/app/(platform)/dashboard/content/actions";

interface AddSectionDialogProps {
  existingSectionTypes: SectionTypeId[];
  onSectionAdded: () => void;
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

export function AddSectionDialog({
  existingSectionTypes,
  onSectionAdded,
}: AddSectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Delay to prevent immediate close on open click
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleAddSection = (type: SectionTypeId) => {
    setError(null);
    startTransition(async () => {
      const result = await addSection(type);
      if (result.success) {
        setIsOpen(false);
        onSectionAdded();
      } else {
        setError(result.error ?? "Failed to add section");
      }
    });
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-5 w-5" />
        Add Section
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          {/* Dialog */}
          <div
            ref={dialogRef}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-section-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 id="add-section-title" className="text-lg font-semibold text-gray-900">
                Add Content Section
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Section type grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SECTION_TYPES.map((sectionType) => {
                const isExisting = existingSectionTypes.includes(sectionType.id);
                const IconComponent = iconMap[sectionType.icon];

                return (
                  <button
                    key={sectionType.id}
                    onClick={() => !isExisting && handleAddSection(sectionType.id)}
                    disabled={isExisting || isPending}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      isExisting
                        ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                    } ${isPending ? "opacity-50" : ""}`}
                  >
                    {IconComponent && (
                      <div
                        className={`p-2 rounded-lg ${
                          isExisting ? "bg-gray-200" : "bg-blue-100"
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${
                            isExisting ? "text-gray-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          isExisting ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {sectionType.label}
                        {isExisting && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                            Added
                          </span>
                        )}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          isExisting ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {sectionType.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <p className="text-sm text-gray-500 text-center">
                Each section type can only be added once.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
