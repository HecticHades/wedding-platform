"use client";

import { Eye, GitCompare, Check, Maximize2 } from "lucide-react";
import type { Template } from "@/lib/content/templates";
import { TemplateMiniPreview } from "./TemplateMiniPreview";

interface TemplateGalleryCardProps {
  template: Template;
  isSelected: boolean;
  isComparing?: boolean;
  onPreview: () => void;
  onCompare: () => void;
  onSelect: () => void;
  isPending?: boolean;
}

export function TemplateGalleryCard({
  template,
  isSelected,
  isComparing,
  onPreview,
  onCompare,
  onSelect,
  isPending,
}: TemplateGalleryCardProps) {
  return (
    <div
      className={`
        relative rounded-xl border-2 overflow-hidden transition-all group
        ${isSelected ? "border-violet-500 shadow-lg" : "border-gray-200 hover:border-gray-300"}
        ${isComparing ? "ring-2 ring-blue-400 ring-offset-2" : ""}
        ${isPending ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Current badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500 text-white shadow-sm">
            <Check className="h-3 w-3" />
            Current
          </span>
        </div>
      )}

      {/* Comparing badge */}
      {isComparing && !isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white shadow-sm">
            <GitCompare className="h-3 w-3" />
            Comparing
          </span>
        </div>
      )}

      {/* Mini preview - landscape 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
        <TemplateMiniPreview theme={template.theme} scale={0.6} fillContainer />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompare();
            }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg
              ${isComparing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            <GitCompare className="h-4 w-4" />
            {isComparing ? "Remove" : "Compare"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors shadow-lg"
            title="Expand Preview"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {template.description}
        </p>

        {/* Color swatches */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-1">
            {[
              template.theme.primaryColor,
              template.theme.secondaryColor,
              template.theme.accentColor,
              template.theme.backgroundColor,
            ].map((color, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">Color palette</span>
        </div>

        {/* Selection button */}
        <button
          type="button"
          onClick={onSelect}
          disabled={isSelected || isPending}
          className={`
            mt-4 w-full py-2.5 px-4 rounded-lg font-medium transition-all
            ${
              isSelected
                ? "bg-violet-100 text-violet-700 cursor-default"
                : "bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md"
            }
            ${isPending ? "cursor-wait" : ""}
            disabled:opacity-50
          `}
        >
          {isPending ? "Applying..." : isSelected ? "Selected" : "Use This Template"}
        </button>
      </div>
    </div>
  );
}
