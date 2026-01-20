"use client";

import { useThemeContext } from "./ThemeProvider";

type DividerStyleType = "none" | "line" | "ornament" | "flourish";

interface ThemeDividerProps {
  className?: string;
  /** Override the theme's dividerStyle for this specific divider */
  dividerStyle?: DividerStyleType;
}

/**
 * Themed divider component that respects the tenant's dividerStyle setting.
 * Supports: none, line, ornament, flourish
 */
export function ThemeDivider({ className = "", dividerStyle: dividerStyleOverride }: ThemeDividerProps) {
  // Try to get dividerStyle from context, fall back to "line" if not in a ThemeProvider
  let contextDividerStyle: DividerStyleType = "line";
  try {
    const context = useThemeContext();
    contextDividerStyle = context.dividerStyle;
  } catch {
    // Not inside ThemeProvider, use default
  }

  const dividerStyle = dividerStyleOverride || contextDividerStyle;

  // Don't render anything for "none" style
  if (dividerStyle === "none") {
    return <div className={`py-4 ${className}`} />;
  }

  // Simple line
  if (dividerStyle === "line") {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="w-full max-w-md h-px bg-wedding-primary/20" />
      </div>
    );
  }

  // Flourish style - decorative swirl
  if (dividerStyle === "flourish") {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="w-16 h-px bg-wedding-primary/20" />
        <svg
          className="mx-3 w-24 h-6 text-wedding-secondary"
          viewBox="0 0 96 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M0 12 C16 12 20 4 32 4 C44 4 44 20 56 20 C68 20 72 12 88 12"
            strokeLinecap="round"
          />
          <circle cx="48" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
        <div className="w-16 h-px bg-wedding-primary/20" />
      </div>
    );
  }

  // Ornament style - heart icon (default)
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="w-full max-w-xs h-px bg-wedding-primary/20" />

      {/* Center ornament - heart */}
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
