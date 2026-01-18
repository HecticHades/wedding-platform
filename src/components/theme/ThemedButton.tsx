"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

/**
 * Themed button component that respects the tenant's theme settings.
 * Supports buttonStyle (solid/outline/soft) via CSS variables.
 */
export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-wedding py-3 px-6 transition-all";

    const widthStyles = fullWidth ? "w-full" : "";

    // Variant-specific styles using theme colors
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-wedding-primary text-white hover:opacity-90 disabled:opacity-50",
      secondary:
        "bg-wedding-secondary text-wedding-text hover:opacity-90 disabled:opacity-50",
      accent:
        "bg-wedding-accent text-white hover:opacity-90 disabled:opacity-50",
      ghost:
        "bg-transparent text-wedding-primary hover:bg-wedding-primary/10 disabled:opacity-50",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${widthStyles} ${variantStyles[variant]} ${className}`}
        style={{
          borderRadius: "var(--wedding-radius-sm)",
          boxShadow: variant !== "ghost" ? "var(--wedding-shadow)" : "none",
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

ThemedButton.displayName = "ThemedButton";
