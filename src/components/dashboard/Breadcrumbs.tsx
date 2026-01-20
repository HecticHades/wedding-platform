"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Map of path segments to display names
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  templates: "Templates",
  theme: "Theme",
  content: "Content",
  domain: "Domain",
  guests: "Guests",
  rsvp: "RSVPs",
  messaging: "Messaging",
  seating: "Seating",
  events: "Events",
  registry: "Registry",
  photos: "Photos",
  settings: "Settings",
  new: "Add New",
  edit: "Edit",
};

/**
 * Breadcrumb navigation component for nested dashboard pages.
 * Can auto-generate breadcrumbs from the current path or accept custom items.
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) {
    // Don't show breadcrumbs if we're at root level
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
    >
      <ol className="flex items-center gap-1" role="list">
        {/* Home icon link */}
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="text-[#3d3936]/50 hover:text-[#3d3936] transition-colors p-1 rounded-md hover:bg-[#e8e4e0] focus:outline-none focus:ring-2 focus:ring-[#c4a4a4]"
            aria-label="Dashboard home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
        </li>

        {breadcrumbs.slice(1).map((item, index) => {
          const isLast = index === breadcrumbs.length - 2;

          return (
            <li key={item.href} className="flex items-center">
              <ChevronRight
                className="h-4 w-4 text-[#3d3936]/30 mx-1"
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className="text-[#3d3936] font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[#3d3936]/60 hover:text-[#3d3936] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c4a4a4] rounded-md px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from a pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Skip UUID-like segments (they're IDs, not navigable)
    if (isUUID(segment)) {
      continue;
    }

    const label = pathLabels[segment] || capitalize(segment);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

/**
 * Check if a string looks like a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
