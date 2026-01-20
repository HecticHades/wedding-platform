"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Palette,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Gift,
  Camera,
  Mail,
  Grid3X3,
  Globe,
  X,
  ExternalLink,
} from "lucide-react";
import { getTenantUrl } from "@/lib/url-utils";

interface DashboardSidebarProps {
  subdomain: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navGroups = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: Home }],
  },
  {
    title: "Your Website",
    items: [
      { href: "/dashboard/templates", label: "Templates", icon: Palette },
      { href: "/dashboard/theme", label: "Theme", icon: Palette },
      { href: "/dashboard/content", label: "Content", icon: FileText },
      { href: "/dashboard/domain", label: "Domain", icon: Globe },
    ],
  },
  {
    title: "Your Guests",
    items: [
      { href: "/dashboard/guests", label: "Guests", icon: Users },
      { href: "/dashboard/rsvp", label: "RSVPs", icon: CheckSquare },
      { href: "/dashboard/messaging", label: "Messaging", icon: Mail },
      { href: "/dashboard/seating", label: "Seating", icon: Grid3X3 },
    ],
  },
  {
    title: "Your Event",
    items: [
      { href: "/dashboard/events", label: "Events", icon: Calendar },
      { href: "/dashboard/registry", label: "Registry", icon: Gift },
      { href: "/dashboard/photos", label: "Photos", icon: Camera },
    ],
  },
];

export function DashboardSidebar({
  subdomain,
  isOpen = true,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Handle escape key to close sidebar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the close button when sidebar opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Add escape key listener
    document.addEventListener("keydown", handleKeyDown);

    // Focus trap: keep focus within sidebar
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusableElements = sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Only apply focus trap on mobile (when sidebar can be toggled)
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      document.addEventListener("keydown", handleTabKey);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);

      // Restore focus when sidebar closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Mobile overlay with fade animation */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 lg:hidden
          transition-opacity duration-200
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="dashboard-sidebar"
        role="navigation"
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-[#faf8f5] border-r border-[#e8e4e0]
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#e8e4e0]">
          <Link
            href="/dashboard"
            className="font-cormorant text-xl font-semibold text-[#3d3936]"
          >
            Wedding Hub
          </Link>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-1 rounded-md hover:bg-[#e8e4e0] text-[#3d3936] focus:outline-none focus:ring-2 focus:ring-[#c4a4a4]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* View Site Link */}
        <div className="px-3 py-3 border-b border-[#e8e4e0]">
          <a
            href={getTenantUrl(subdomain)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#c4a4a4]/10 text-[#3d3936] hover:bg-[#c4a4a4]/20 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View Your Website
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-[#3d3936]/60 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-1" role="list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                          transition-colors
                          ${
                            active
                              ? "bg-[#c4a4a4]/20 text-[#3d3936]"
                              : "text-[#3d3936]/70 hover:bg-[#e8e4e0] hover:text-[#3d3936]"
                          }
                        `}
                      >
                        <Icon
                          className={`h-4 w-4 ${active ? "text-[#c4a4a4]" : ""}`}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
