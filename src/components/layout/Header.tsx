import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  /** Title to display in header */
  title?: string;
  /** Navigation items */
  navItems?: Array<{ href: string; label: string }>;
  className?: string;
}

export function Header({ title, navItems = [], className }: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full border-b border-gray-200',
        'bg-white/80 backdrop-blur-sm',
        'sticky top-0 z-50',
        className
      )}
    >
      <div className={cn(
        // Mobile: stacked layout
        'flex flex-col gap-2 px-4 py-3',
        // Tablet+: horizontal layout
        'sm:flex-row sm:items-center sm:justify-between sm:px-6',
        'md:px-8',
        'lg:max-w-4xl lg:mx-auto xl:max-w-5xl'
      )}>
        {title && (
          <h1 className="text-lg font-semibold sm:text-xl">
            {title}
          </h1>
        )}
        {navItems.length > 0 && (
          <nav className={cn(
            // Mobile: wrap navigation
            'flex flex-wrap gap-2',
            // Desktop: horizontal with more spacing
            'sm:gap-4 md:gap-6'
          )}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm text-gray-600 hover:text-gray-900',
                  'transition-colors',
                  'sm:text-base'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
