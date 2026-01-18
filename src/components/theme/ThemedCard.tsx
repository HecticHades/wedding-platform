"use client";

import { HTMLAttributes, forwardRef } from "react";

export type CardVariant = "default" | "glass" | "elevated";

interface ThemedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/**
 * Themed card component that respects the tenant's theme settings.
 * Uses CSS variables for borderRadius and shadow.
 */
export const ThemedCard = forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ variant = "default", children, className = "", style, ...props }, ref) => {
    const baseStyles = "border border-wedding-primary/10";

    const variantStyles: Record<CardVariant, string> = {
      default: "bg-white/90",
      glass: "bg-white/80 backdrop-blur-sm",
      elevated: "bg-white",
    };

    // Elevated variant gets stronger shadow
    const getShadow = (v: CardVariant): string => {
      if (v === "elevated") {
        return "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)";
      }
      return "var(--wedding-shadow)";
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        style={{
          borderRadius: "var(--wedding-radius-lg)",
          boxShadow: getShadow(variant),
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ThemedCard.displayName = "ThemedCard";
