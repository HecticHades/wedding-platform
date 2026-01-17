"use client";

import { useTransition } from "react";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        onCancel(); // Close form on success
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Table Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Table Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name ?? ""}
          placeholder="e.g., Table 1, Head Table"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Capacity */}
      <div>
        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Capacity (seats)
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          defaultValue={initialData?.capacity ?? 10}
          min={1}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Total seats including plus-ones
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : initialData ? "Update Table" : "Create Table"}
        </button>
      </div>
    </form>
  );
}
