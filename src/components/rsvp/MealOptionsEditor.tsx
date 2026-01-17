"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { updateMealOptions, type MealOption } from "@/app/(platform)/dashboard/events/actions";

interface MealOptionsEditorProps {
  eventId: string;
  initialOptions: MealOption[];
}

/**
 * Meal options configuration editor for events
 */
export function MealOptionsEditor({ eventId, initialOptions }: MealOptionsEditorProps) {
  const [options, setOptions] = useState<MealOption[]>(initialOptions);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Generate a unique ID for new options
  function generateId() {
    return `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  function handleAddOption() {
    setOptions((prev) => [
      ...prev,
      { id: generateId(), name: "", description: "" },
    ]);
  }

  function handleRemoveOption(id: string) {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  }

  function handleUpdateOption(id: string, field: "name" | "description", value: string) {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setOptions((prev) => {
      const newOptions = [...prev];
      [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
      return newOptions;
    });
  }

  function handleMoveDown(index: number) {
    if (index === options.length - 1) return;
    setOptions((prev) => {
      const newOptions = [...prev];
      [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
      return newOptions;
    });
  }

  function handleSave() {
    setError(null);
    setSuccess(false);

    // Filter out empty options
    const validOptions = options.filter((opt) => opt.name.trim());

    // Validate all options have names
    if (options.some((opt) => !opt.name.trim())) {
      setError("All meal options must have a name");
      return;
    }

    startTransition(async () => {
      const result = await updateMealOptions(eventId, validOptions);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Options List */}
      <div className="space-y-4">
        {options.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No meal options configured</p>
            <button
              onClick={handleAddOption}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add First Option
            </button>
          </div>
        ) : (
          options.map((option, index) => (
            <div
              key={option.id}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4"
            >
              {/* Move Handles */}
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <GripVertical className="h-4 w-4 text-gray-300" />
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === options.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-3">
                <div>
                  <label
                    htmlFor={`name-${option.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Option Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`name-${option.id}`}
                    value={option.name}
                    onChange={(e) => handleUpdateOption(option.id, "name", e.target.value)}
                    placeholder="e.g., Grilled Salmon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`desc-${option.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    id={`desc-${option.id}`}
                    value={option.description ?? ""}
                    onChange={(e) => handleUpdateOption(option.id, "description", e.target.value)}
                    placeholder="e.g., With lemon butter sauce and seasonal vegetables"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleRemoveOption(option.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete option"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      {options.length > 0 && (
        <button
          onClick={handleAddOption}
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700">Meal options saved successfully!</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Save Options
            </>
          )}
        </button>
      </div>
    </div>
  );
}
