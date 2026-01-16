import { cn } from '@/lib/utils';

interface FooterProps {
  /** Couple names to display */
  coupleNames?: string;
  className?: string;
}

export function Footer({ coupleNames, className }: FooterProps) {
  return (
    <footer
      className={cn(
        'w-full border-t border-gray-200',
        'mt-auto',
        className
      )}
    >
      <div className={cn(
        'px-4 py-6 text-center',
        'sm:px-6 md:px-8',
        'lg:max-w-4xl lg:mx-auto xl:max-w-5xl'
      )}>
        {coupleNames && (
          <p className="text-sm text-gray-500">
            {coupleNames}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Powered by Wedding Platform
        </p>
      </div>
    </footer>
  );
}
