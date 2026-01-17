"use client";

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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
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
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-[#e8e4e0] text-[#3d3936]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View Site Link */}
        <div className="px-3 py-3 border-b border-[#e8e4e0]">
          <a
            href={`${window.location.protocol}//${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#c4a4a4]/10 text-[#3d3936] hover:bg-[#c4a4a4]/20 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
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
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
