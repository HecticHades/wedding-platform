"use client";

import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";

interface TableFormProps {
  initialData?: {
    id: string;
    name: string;
    capacity: number;
  };
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function TableForm({ initialData, onSubmit, onCancel }: TableFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Basic client-side validation
    const name = formData.get("name") as string;
    const capacity = parseInt(formData.get("capacity") as string, 10);

    if (!name.trim()) {
      setError("Table name is required");
      return;
    }

    if (isNaN(capacity) || capacity < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    if (capacity > 50) {
      setError("Capacity cannot exceed 50 seats");
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        onCancel(); // Close form on success
      } else {
        setError(result.error || "Failed to save table. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error display */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 text-lg leading-none focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Table Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Table Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name ?? ""}
          placeholder="e.g., Table 1, Head Table"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
          aria-required="true"
        />
      </div>

      {/* Capacity */}
      <div>
        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Capacity (seats) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          defaultValue={initialData?.capacity ?? 10}
          min={1}
          max={50}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
          aria-required="true"
          aria-describedby="capacity-hint"
        />
        <p id="capacity-hint" className="mt-1 text-xs text-gray-500">
          Total seats including plus-ones (max 50)
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Saving...
            </span>
          ) : initialData ? (
            "Update Table"
          ) : (
            "Create Table"
          )}
        </button>
      </div>
    </form>
  );
}
