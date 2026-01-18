"use client";

import { Save, ExternalLink, RotateCcw, Check, Loader2 } from "lucide-react";

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
  return (
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
            onClick={onReset}
            disabled={!hasChanges}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
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
