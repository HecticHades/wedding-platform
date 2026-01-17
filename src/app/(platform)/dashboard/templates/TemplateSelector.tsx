"use client";

import { useTransition, useState } from "react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { applyTemplate } from "./actions";
import type { Template } from "@/lib/content/templates";

interface TemplateSelectorProps {
  templates: Template[];
  currentTemplateId: string;
}

/**
 * Client component for template selection with optimistic updates
 * Uses useTransition for pending state during server action
 */
export function TemplateSelector({
  templates,
  currentTemplateId: initialTemplateId,
}: TemplateSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(initialTemplateId);
  const [error, setError] = useState<string | null>(null);

  // Find the selected template for preview
  const selectedTemplate = templates.find((t) => t.id === selectedId);

  const handleSelect = (templateId: string) => {
    setError(null);

    startTransition(async () => {
      const result = await applyTemplate(templateId);

      if (result.success) {
        setSelectedId(templateId);
      } else {
        setError(result.error || "Failed to apply template");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            onSelect={() => handleSelect(template.id)}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Live preview section */}
      {selectedTemplate && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Live Preview: {selectedTemplate.name}
          </h2>
          <div className="max-w-xs mx-auto">
            <TemplatePreview theme={selectedTemplate.theme} />
          </div>
        </div>
      )}
    </div>
  );
}
