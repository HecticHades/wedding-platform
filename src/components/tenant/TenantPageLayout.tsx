interface TenantPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: "md" | "2xl" | "4xl" | "6xl";
  className?: string;
}

const maxWidthClasses = {
  md: "max-w-md",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
};

/**
 * Consistent content wrapper for tenant pages.
 * Provides consistent padding and max-width container below the hero.
 */
export function TenantPageLayout({
  children,
  maxWidth = "2xl",
  className = "",
}: TenantPageLayoutProps) {
  return (
    <div className={`py-12 md:py-16 px-4 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>{children}</div>
    </div>
  );
}
