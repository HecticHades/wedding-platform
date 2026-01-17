"use client";

import Image from "next/image";
import type { Template } from "@/lib/content/templates";

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  isPending?: boolean;
}

/**
 * Individual template card component for template selection
 * Displays thumbnail, name, description and selection state
 */
export function TemplateCard({
  template,
  isSelected,
  onSelect,
  isPending,
}: TemplateCardProps) {
  return (
    <div
      className={`
        relative rounded-lg border-2 overflow-hidden transition-all
        ${isSelected ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
        ${isPending ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
            Current
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={template.thumbnail}
          alt={`${template.name} preview`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {template.description}
        </p>

        {/* Color preview */}
        <div className="mt-3 flex gap-1">
          <div
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: template.theme.primaryColor }}
            title="Primary color"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: template.theme.secondaryColor }}
            title="Secondary color"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: template.theme.backgroundColor }}
            title="Background color"
          />
          <div
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: template.theme.textColor }}
            title="Text color"
          />
        </div>

        {/* Selection button */}
        <button
          type="button"
          onClick={onSelect}
          disabled={isSelected || isPending}
          className={`
            mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors
            ${
              isSelected
                ? "bg-blue-100 text-blue-700 cursor-default"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
            ${isPending ? "cursor-wait" : ""}
            disabled:opacity-50
          `}
        >
          {isPending ? "Applying..." : isSelected ? "Selected" : "Select Template"}
        </button>
      </div>
    </div>
  );
}
