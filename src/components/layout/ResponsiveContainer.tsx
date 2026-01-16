import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Use narrow width for content-focused pages */
  narrow?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  narrow = false
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        // Mobile-first: full width with padding
        'w-full px-4',
        // Tablet: slightly more padding
        'sm:px-6',
        // Desktop: centered with max-width
        'md:px-8',
        narrow
          ? 'lg:max-w-2xl lg:mx-auto'
          : 'lg:max-w-4xl lg:mx-auto',
        // Large desktop: wider max-width
        !narrow && 'xl:max-w-5xl',
        className
      )}
    >
      {children}
    </div>
  );
}
