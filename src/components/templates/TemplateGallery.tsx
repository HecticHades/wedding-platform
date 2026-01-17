"use client";

import { useState, useTransition } from "react";
import type { Template } from "@/lib/content/templates";
import { TemplateGalleryCard } from "./TemplateGalleryCard";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateComparison } from "./TemplateComparison";

interface TemplateGalleryProps {
  templates: Template[];
  currentTemplateId: string;
  onApplyTemplate: (templateId: string) => Promise<{ success: boolean; error?: string }>;
}

export function TemplateGallery({
  templates,
  currentTemplateId: initialTemplateId,
  onApplyTemplate,
}: TemplateGalleryProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(initialTemplateId);
  const [error, setError] = useState<string | null>(null);

  // Preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Comparison state
  const [compareTemplates, setCompareTemplates] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelect = (templateId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await onApplyTemplate(templateId);
      if (result.success) {
        setSelectedId(templateId);
        setPreviewTemplate(null);
        setShowComparison(false);
      } else {
        setError(result.error || "Failed to apply template");
      }
    });
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleCompare = (templateId: string) => {
    setCompareTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((id) => id !== templateId);
      }
      if (prev.length >= 2) {
        return [prev[1], templateId];
      }
      return [...prev, templateId];
    });
  };

  const handleOpenComparison = () => {
    if (compareTemplates.length === 2) {
      setShowComparison(true);
    }
  };

  // Get templates for comparison
  const comparisonTemplates = compareTemplates
    .map((id) => templates.find((t) => t.id === id))
    .filter(Boolean) as Template[];

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Comparison bar */}
      {compareTemplates.length > 0 && (
        <div className="sticky top-0 z-30 bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-violet-700">
              {compareTemplates.length}/2 templates selected for comparison
            </span>
            <div className="flex -space-x-2">
              {compareTemplates.map((id) => {
                const template = templates.find((t) => t.id === id);
                if (!template) return null;
                return (
                  <div
                    key={id}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: template.theme.primaryColor }}
                    title={template.name}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareTemplates([])}
              className="px-3 py-1.5 text-sm text-violet-700 hover:text-violet-900 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleOpenComparison}
              disabled={compareTemplates.length !== 2}
              className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateGalleryCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            isComparing={compareTemplates.includes(template.id)}
            onPreview={() => handlePreview(template)}
            onCompare={() => handleCompare(template.id)}
            onSelect={() => handleSelect(template.id)}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          templates={templates}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleSelect}
          onTemplateChange={(id) => {
            const t = templates.find((t) => t.id === id);
            if (t) setPreviewTemplate(t);
          }}
        />
      )}

      {/* Comparison modal */}
      {showComparison && comparisonTemplates.length === 2 && (
        <TemplateComparison
          templates={comparisonTemplates as [Template, Template]}
          allTemplates={templates}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          onSelect={handleSelect}
          onSwap={(index, templateId) => {
            setCompareTemplates((prev) => {
              const newList = [...prev];
              newList[index] = templateId;
              return newList;
            });
          }}
        />
      )}
    </div>
  );
}
