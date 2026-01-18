"use client";

import { useState } from "react";
import { Save, ExternalLink, RotateCcw, Check, Loader2, X, AlertTriangle } from "lucide-react";

interface ThemeStudioHeaderProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  siteUrl: string;
}

export function ThemeStudioHeader({
  onSave,
  onReset,
  isSaving,
  hasChanges,
  lastSaved,
  siteUrl,
}: ThemeStudioHeaderProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleDiscardClick = () => {
    setShowDiscardDialog(true);
  };

  const handleConfirmDiscard = () => {
    onReset();
    setShowDiscardDialog(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardDialog(false);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title and status */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Theme Studio</h1>
            <div className="flex items-center gap-2 mt-1">
              {hasChanges ? (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Unsaved changes
                </span>
              ) : lastSaved ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Saved {formatLastSaved(lastSaved)}
                </span>
              ) : (
                <span className="text-sm text-gray-500">Ready to customize</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscardClick}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              Discard Changes
            </button>

            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Preview Live
            </a>

            <button
              onClick={onSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Theme
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discard Changes Confirmation Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelDiscard}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <button
              onClick={handleCancelDiscard}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Discard Changes?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  All unsaved changes to your theme will be lost. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancelDiscard}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
