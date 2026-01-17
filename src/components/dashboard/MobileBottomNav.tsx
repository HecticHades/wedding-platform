"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, Users, Calendar, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/templates", label: "Design", icon: Palette },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/settings", label: "More", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e8e4e0] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3
                rounded-lg transition-colors min-w-[60px]
                ${
                  active
                    ? "text-[#c4a4a4]"
                    : "text-[#3d3936]/60 hover:text-[#3d3936]"
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-current/10" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
