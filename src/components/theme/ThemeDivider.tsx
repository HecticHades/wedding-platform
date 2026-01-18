"use client";

interface ThemeDividerProps {
  className?: string;
}

/**
 * Themed divider component that respects the tenant's dividerStyle setting.
 * Supports: none, line, ornament, flourish
 */
export function ThemeDivider({ className = "" }: ThemeDividerProps) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      {/* Line divider - default */}
      <div className="w-full max-w-xs h-px bg-wedding-primary/20" />

      {/* Center ornament */}
      <div className="mx-4 flex-shrink-0">
        <svg
          className="w-6 h-6 text-wedding-secondary"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 4.5C9 4.5 6 6.5 6 9.5C6 12.5 12 19.5 12 19.5C12 19.5 18 12.5 18 9.5C18 6.5 15 4.5 12 4.5ZM12 11.5C10.9 11.5 10 10.6 10 9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5C14 10.6 13.1 11.5 12 11.5Z" />
        </svg>
      </div>

      <div className="w-full max-w-xs h-px bg-wedding-primary/20" />
    </div>
  );
}
