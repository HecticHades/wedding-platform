"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { ExternalRegistry } from "@prisma/client";

interface ExternalRegistryCardProps {
  registry: ExternalRegistry;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
}

/**
 * Card component displaying an external registry link with edit/delete actions
 */
export function ExternalRegistryCard({
  registry,
  onEdit,
  onDelete,
}: ExternalRegistryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(registry.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header with name and actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {registry.name}
            </h3>
            {registry.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {registry.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit registry"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete registry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Registry URL */}
        <div className="mt-3">
          <a
            href={registry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="truncate max-w-xs">{registry.url}</span>
          </a>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900">
              Delete Registry Link?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete the link to &quot;{registry.name}
              &quot;? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
