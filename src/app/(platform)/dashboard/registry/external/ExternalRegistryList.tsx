"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import type { ExternalRegistry } from "@prisma/client";
import { ExternalRegistryCard } from "@/components/registry/ExternalRegistryCard";
import { ExternalRegistryForm } from "@/components/registry/ExternalRegistryForm";
import {
  createExternalRegistry,
  updateExternalRegistry,
  deleteExternalRegistry,
} from "./actions";

interface RegistrySuggestion {
  name: string;
  url: string;
}

interface ExternalRegistryListProps {
  registries: ExternalRegistry[];
  suggestions: RegistrySuggestion[];
}

export function ExternalRegistryList({
  registries,
  suggestions,
}: ExternalRegistryListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<ExternalRegistry | null>(
    null
  );

  const handleDelete = async (id: string) => {
    const result = await deleteExternalRegistry(id);
    if (!result.success) {
      alert(result.error || "Failed to delete registry");
    }
  };

  const handleCreate = async (formData: FormData) => {
    const result = await createExternalRegistry(formData);
    if (result.success) {
      setShowAddForm(false);
    }
    return result;
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingRegistry) return { success: false, error: "No registry selected" };
    const result = await updateExternalRegistry(editingRegistry.id, formData);
    if (result.success) {
      setEditingRegistry(null);
    }
    return result;
  };

  // Filter suggestions to exclude already-added registries (by name match)
  const existingNames = new Set(
    registries.map((r) => r.name.toLowerCase())
  );
  const availableSuggestions = suggestions.filter(
    (s) => !existingNames.has(s.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Registry list */}
      {registries.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {registries.map((registry) => (
            <ExternalRegistryCard
              key={registry.id}
              registry={registry}
              onEdit={() => setEditingRegistry(registry)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No external registries yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Add links to registries on other platforms where guests can shop.
          </p>
        </div>
      )}

      {/* Add new registry section */}
      {showAddForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add External Registry
          </h3>
          <ExternalRegistryForm
            action={handleCreate}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Registry
          </button>

          {/* Quick add suggestions */}
          {availableSuggestions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Popular registries to add:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => {
                      // Pre-fill form with suggestion
                      setShowAddForm(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editingRegistry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Registry Link
            </h3>
            <ExternalRegistryForm
              registry={editingRegistry}
              action={handleUpdate}
              onSuccess={() => setEditingRegistry(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
