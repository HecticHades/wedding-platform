"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { useThemeContext } from "./ThemeProvider";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
export type ButtonStyleType = "solid" | "outline" | "soft";

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Override the theme's buttonStyle for this specific button */
  buttonStyle?: ButtonStyleType;
}

/**
 * Themed button component that respects the tenant's theme settings.
 * Supports buttonStyle (solid/outline/soft) from the theme context.
 */
export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      buttonStyle: buttonStyleOverride,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Try to get buttonStyle from context, fall back to "solid" if not in a ThemeProvider
    let contextButtonStyle: ButtonStyleType = "solid";
    try {
      const context = useThemeContext();
      contextButtonStyle = context.buttonStyle;
    } catch {
      // Not inside ThemeProvider, use default
    }

    const buttonStyle = buttonStyleOverride || contextButtonStyle;

    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-wedding transition-all whitespace-nowrap";

    const widthStyles = fullWidth ? "w-full" : "";

    // Get styles based on buttonStyle and variant
    const getVariantStyles = (): string => {
      if (variant === "ghost") {
        return "bg-transparent text-wedding-primary hover:bg-wedding-primary/10 disabled:opacity-50";
      }

      switch (buttonStyle) {
        case "outline":
          return variant === "primary"
            ? "bg-transparent text-wedding-primary border-2 border-wedding-primary hover:bg-wedding-primary/10 disabled:opacity-50"
            : variant === "secondary"
            ? "bg-transparent text-wedding-secondary border-2 border-wedding-secondary hover:bg-wedding-secondary/10 disabled:opacity-50"
            : "bg-transparent text-wedding-accent border-2 border-wedding-accent hover:bg-wedding-accent/10 disabled:opacity-50";
        case "soft":
          return variant === "primary"
            ? "bg-wedding-primary/20 text-wedding-primary hover:bg-wedding-primary/30 disabled:opacity-50"
            : variant === "secondary"
            ? "bg-wedding-secondary/20 text-wedding-secondary hover:bg-wedding-secondary/30 disabled:opacity-50"
            : "bg-wedding-accent/20 text-wedding-accent hover:bg-wedding-accent/30 disabled:opacity-50";
        case "solid":
        default:
          return variant === "primary"
            ? "bg-wedding-primary text-white hover:opacity-90 disabled:opacity-50"
            : variant === "secondary"
            ? "bg-wedding-secondary text-wedding-text hover:opacity-90 disabled:opacity-50"
            : "bg-wedding-accent text-white hover:opacity-90 disabled:opacity-50";
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${widthStyles} ${getVariantStyles()} ${className}`}
        style={{
          borderRadius: "var(--wedding-radius-sm)",
          padding: "var(--wedding-button-padding, 0.75rem 1.5rem)",
          boxShadow: variant !== "ghost" && buttonStyle === "solid" ? "var(--wedding-shadow)" : "none",
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
