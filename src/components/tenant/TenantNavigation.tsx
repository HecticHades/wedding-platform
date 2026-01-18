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
    { href: "/", label: "Home", icon: Home, show: true },
    { href: "/rsvp", label: "RSVP", icon: Mail, show: showRsvp },
    { href: "/photos", label: "Photos", icon: Camera, show: showPhotos },
    { href: "/registry", label: "Registry", icon: Gift, show: showRegistry },
    { href: "/seating", label: "Seating", icon: Users, show: showSeating },
  ].filter(item => item.show);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === `/${domain}`;
    }
    return pathname?.startsWith(href) || pathname?.startsWith(`/${domain}${href}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Wedding name */}
          <Link
            href="/"
            className="font-semibold text-gray-900 text-sm truncate max-w-[150px] sm:max-w-none"
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
