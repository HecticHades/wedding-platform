"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, Camera, Gift, Users } from "lucide-react";

interface TenantNavigationProps {
  domain: string;
  weddingName: string;
  showRsvp?: boolean;
  showPhotos?: boolean;
  showRegistry?: boolean;
  showSeating?: boolean;
}

export function TenantNavigation({
  domain,
  weddingName,
  showRsvp = true,
  showPhotos = true,
  showRegistry = true,
  showSeating = false,
}: TenantNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${domain}`, label: "Home", icon: Home, show: true },
    { href: `/${domain}/rsvp`, label: "RSVP", icon: Mail, show: showRsvp },
    { href: `/${domain}/photos`, label: "Photos", icon: Camera, show: showPhotos },
    { href: `/${domain}/registry`, label: "Registry", icon: Gift, show: showRegistry },
    { href: `/${domain}/seating`, label: "Seating", icon: Users, show: showSeating },
  ].filter(item => item.show);

  const isActive = (href: string) => {
    if (href === `/${domain}`) {
      return pathname === `/${domain}`;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-wedding-background/95 backdrop-blur-sm border-b border-wedding-primary/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Wedding name */}
          <Link
            href={`/${domain}`}
            className="font-wedding-heading text-wedding-text text-sm truncate max-w-[150px] sm:max-w-none"
          >
            {weddingName}
          </Link>

          {/* Navigation links */}
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(href)
                      ? "bg-wedding-primary/10 text-wedding-primary"
                      : "text-wedding-text/70 hover:bg-wedding-primary/5 hover:text-wedding-text"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
