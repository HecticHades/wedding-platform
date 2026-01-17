"use client";

import { useFormStatus } from "react-dom";
import type { ExternalRegistry } from "@prisma/client";
import Link from "next/link";

interface ExternalRegistryFormProps {
  registry?: ExternalRegistry;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending
        ? isEdit
          ? "Saving..."
          : "Adding..."
        : isEdit
          ? "Save Changes"
          : "Add Registry"}
    </button>
  );
}

/**
 * Form for creating/editing external registry links
 */
export function ExternalRegistryForm({
  registry,
  action,
  onSuccess,
}: ExternalRegistryFormProps) {
  const isEdit = !!registry;

  async function handleSubmit(formData: FormData) {
    const result = await action(formData);
    if (result.success && onSuccess) {
      onSuccess();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Registry Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Registry Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={registry?.name || ""}
          placeholder="e.g., Amazon Wedding Registry"
          required
          maxLength={50}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Registry URL */}
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          Registry URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="url"
          name="url"
          defaultValue={registry?.url || ""}
          placeholder="https://www.amazon.com/wedding/..."
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the full URL to your registry page
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={registry?.description || ""}
          placeholder="A brief note about this registry..."
          rows={2}
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Max 200 characters
        </p>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Link
          href="/dashboard/registry/external"
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Cancel
        </Link>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
